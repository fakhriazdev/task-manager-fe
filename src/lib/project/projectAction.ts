'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { CommonResponse } from '@/lib/store/storeTypes'
import {
    AddSubTaskRequest,
    AssigneeInput, CreateProjectPayload,
    MoveSectionPayload, MoveSubTaskPayload,
    MoveTaskPayload,
    Project,
    ProjectDetail,
    Task,
    TaskList,
    TaskPatch,
    TaskUpdateInput, UpdateSubTaskRequest,
} from '@/lib/project/projectTypes'
import ProjectService from '@/lib/project/projectService'
import { Assignees } from "@/app/dashboard/projects/[id]/list/types/task"
import {useMemo} from 'react'
import {toast} from "sonner";


// CONSTANTS & CONFIG
const TASK_STALE_TIME = 2 * 1000 // 2 seconds
const TASK_GC_TIME = 5 * 60 * 1000 // 5 minutes
const POLLING_INTERVAL = 3000 // 3 seconds
const MAX_RETRY_COUNT = 3

// QUERY KEYS
const qk = {
    projects: () => ['projects'] as const,
    project: (id?: string) => ['project', id] as const,
    tasks: (id?: string) => ['tasks', id] as const,
    task: (projectId?: string, taskId?: string) => ['task', projectId, taskId] as const, // 👈 baru
}
// ERROR HANDLING UTILITIES
interface ApiError {
    statusCode?: number
    status?: number
    error?: string
    message?: string
    response?: {
        status?: number
        data?: {
            statusCode?: number
            error?: string
            message?: string
        }
    }
}

function isForbiddenError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false

    const err = error as ApiError

    if (err.statusCode === 403 || err.status === 403) return true
    if (err.error === 'Forbidden') return true

    // Check nested response
    if (err.response?.status === 403) return true
    if (err.response?.data?.statusCode === 403) return true
    if (err.response?.data?.error === 'Forbidden') return true

    return false
}

function isClientError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false

    const err = error as ApiError
    const status = err.statusCode ?? err.status ?? err.response?.status ?? 0

    return status >= 400 && status < 500
}

function useErrorHandler(projectId?: string) {
    const router = useRouter()

    return (error: unknown) => {
        if (isForbiddenError(error)) {
            const queryParams = new URLSearchParams()
            queryParams.set('reason', 'project-access')
            if (projectId) {
                queryParams.set('id', projectId)
            }

            router.push(`/forbidden?${queryParams.toString()}`)
        }
    }
}


// UTILITY FUNCTIONS
function moveInArray<T>(arr: T[], from: number, to: number): T[] {
    if (from === to) return arr
    if (from < 0 || to < 0 || from >= arr.length || to >= arr.length) {
        console.warn('Invalid move indices:', { from, to, length: arr.length })
        return [...arr]
    }

    const copy = arr.slice()
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    return copy
}

const insertAt = <T,>(arr: T[], idx: number, item: T): T[] => {
    const i = Math.max(0, Math.min(idx, arr.length))
    return [...arr.slice(0, i), item, ...arr.slice(i)]
}

const computeInsertIndex = (
    ids: string[],
    beforeId?: string | null,
    afterId?: string | null
): number => {
    if (beforeId) {
        const j = ids.findIndex((x) => x === beforeId)
        if (j !== -1) return j
    }
    if (afterId) {
        const i = ids.findIndex((x) => x === afterId)
        if (i !== -1) return i + 1
    }
    return ids.length
}

const mapAllTasks = (list: TaskList, map: (t: Task) => Task): TaskList => ({
    ...list,
    sections: (list.sections ?? []).map(s => ({
        ...s,
        tasks: (s.tasks ?? []).map(map)
    })),
    unlocated: (list.unlocated ?? []).map(map),
})

const findTaskById = (list: TaskList | undefined, taskId: string): Task | null => {
    if (!list) return null

    const unlocated = list.unlocated?.find(t => t.id === taskId)
    if (unlocated) return unlocated

    for (const section of list.sections ?? []) {
        const task = section.tasks?.find(t => t.id === taskId)
        if (task) return task
    }

    return null
}

const assertNever = (x: never): never => {
    throw new Error(`Unhandled case: ${JSON.stringify(x)}`)
}

const toPatch = (input: TaskUpdateInput): TaskPatch => {
    switch (input.type) {
        case 'rename':
            return { name: input.name.trim() }
        case 'setDesc':
            return { desc: input.desc ?? null }
        case 'setDueDate':
            return { dueDate: input.dueDate ?? null }
        case 'setStatus':
            return { status: input.status }
        case 'setAssignees':
            return {
                assignees: input.assignees.map((a) => ({ nik: a.nik, name: a.name })),
            }
        default:
            return assertNever(input as never)
    }
}

const mergeAssigneesOptimistic = (
    prev: Assignees[] | null | undefined,
    incoming: AssigneeInput[]
): Assignees[] => {
    const prevMap = new Map((prev ?? []).map((a) => [a.nik, a]))
    return incoming.map((a) => {
        const kept = prevMap.get(a.nik)
        return kept
            ? { ...kept, name: a.name }
            : { nik: a.nik, name: a.name, assignedAt: new Date() }
    })
}

const applyOptimistic = (t: Task, input: TaskUpdateInput): Task => {
    switch (input.type) {
        case 'rename': {
            const name = input.name.trim()
            return name && name !== t.name ? { ...t, name } : t
        }
        case 'setDesc': {
            const desc = input.desc ?? null
            return desc !== t.desc ? { ...t, desc } : t
        }
        case 'setDueDate': {
            const dueDate = input.dueDate ?? null
            return dueDate !== t.dueDate ? { ...t, dueDate } : t
        }
        case 'setStatus':
            return input.status !== t.status ? { ...t, status: input.status } : t
        case 'setAssignees': {
            const merged = mergeAssigneesOptimistic(t.assignees, input.assignees)
            return { ...t, assignees: merged }
        }
        default:
            return assertNever(input as never)
    }
}


// HOOKS
export function useProjectAction() {
    const handleError = useErrorHandler()

    return useQuery({
        queryKey: qk.projects(),
        queryFn: async () => {
            try {
                const res: CommonResponse<Project[]> = await ProjectService.getOwnProject()
                return res.data ?? []
            } catch (error) {
                handleError(error)
                throw error
            }
        },
        staleTime: TASK_STALE_TIME,
        gcTime: TASK_GC_TIME,
        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false
            return failureCount < MAX_RETRY_COUNT && !isClientError(error)
        },
    })
}

export function useNewProjectAction() {
    const qc = useQueryClient();
    const router = useRouter();
    const handleError = useErrorHandler();

    return useMutation<CommonResponse<{ projectId:string }>, Error, CreateProjectPayload>({
        mutationKey: ['project-create'],
        mutationFn: async (payload) => {
            try {
                return await ProjectService.addProject(payload);
            } catch (error) {
                handleError(error);
                throw error;
            }
        },
        onMutate: () => toast.loading("Creating Project..."),
        onSuccess: (res) => {
            toast.dismiss();
            qc.invalidateQueries({ queryKey: qk.projects() });
            const id = res.data?.projectId;
            if (id) {
                router.push(`/dashboard/projects/${id}`);
            }
            toast.success("Project Successfully created!");
        },
        onError: (error) => {
            if (!isForbiddenError(error)) {
                console.error('Project create failed:', error);
            }
        },
    });
}



export function useProjectDetailAction(idProject?: string) {
    const handleError = useErrorHandler(idProject)

    return useQuery({
        queryKey: qk.project(idProject),
        enabled: !!idProject,
        queryFn: async () => {
            try {
                const res: CommonResponse<ProjectDetail> =
                    await ProjectService.getProject(idProject as string)
                return res.data
            } catch (error) {
                handleError(error)
                throw error
            }
        },
        staleTime: TASK_STALE_TIME,
        gcTime: TASK_GC_TIME,
        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false
            return failureCount < MAX_RETRY_COUNT && !isClientError(error)
        },
    })
}

export function useProjectTasksAction(
    idProject?: string,
    enablePolling: boolean = false
) {
    const handleError = useErrorHandler(idProject)

    return useQuery({
        queryKey: qk.tasks(idProject),
        enabled: !!idProject,
        queryFn: async () => {
            try {
                const res: CommonResponse<TaskList> =
                    await ProjectService.getTask(idProject as string)
                return res.data
            } catch (error) {
                handleError(error)
                throw error
            }
        },
        refetchInterval: (query) => {
            if (!enablePolling) return false
            if (query.state.error) return false
            return POLLING_INTERVAL
        },
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        staleTime: TASK_STALE_TIME,
        gcTime: TASK_GC_TIME,
        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false
            return failureCount < MAX_RETRY_COUNT && !isClientError(error)
        },
    })
}

export function useLiveTask(projectId?: string, taskId?: string) {
    const { data: taskList } = useProjectTasksAction(projectId, false)
    return useMemo(() => {
        if (!projectId || !taskId || !taskList) return null
        return findTaskById(taskList, taskId)
    }, [projectId, taskId, taskList])
}


// MUTATION HOOKS
type CreateVars = {
    name: string;
    section?: string | null;
    tag?: string;
    desc?: string;
    beforeId?: string | null;
    afterId?: string | null;
};
export const useCreateTaskAction = (projectId?: string) => {
    const qc = useQueryClient();
    const key = ['tasks', projectId] as const;

    return useMutation<
        CommonResponse<string>,
        Error,
        CreateVars,
        { prev?: TaskList; tempId?: string }
    >({
        mutationKey: ['task-create', projectId],
        mutationFn: async (vars) => {
            if (!projectId) throw new Error('Project ID is required');
            return ProjectService.addTask(projectId, {
                name: vars.name,
                tag: vars.tag,
                desc: vars.desc,
                section: vars.section ?? undefined,
            });
        },

        onMutate: async ({ name, section = null, tag, desc, beforeId = null, afterId = null }) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<TaskList>(key);
            const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

            if (prev) {
                const next: TaskList = {
                    unlocated: [...(prev.unlocated ?? [])],
                    sections: (prev.sections ?? []).map((s) => ({ ...s, tasks: [...(s.tasks ?? [])] })),
                };

                // Minimal shape Task supaya UI kamu aman
                const newTask = ({
                    id: tempId,
                    name,
                    desc: desc ?? null,
                    tag: tag ?? undefined,
                    // tambahkan default field lain sesuai tipe Task kamu
                    // status: 'todo', assignees: [], dueDate: null, ...
                } as unknown) as Task;

                const insertWithOrder = (list: Task[]) => {
                    const ids = list.map((t) => t.id);
                    const ins = computeInsertIndex(ids, beforeId, afterId);
                    return insertAt(list, ins, newTask);
                };

                if (!section) {
                    next.unlocated = insertWithOrder(next.unlocated);
                } else {
                    const sec = next.sections.find((s) => s.id === section);
                    if (sec) sec.tasks = insertWithOrder(sec.tasks);
                    else next.unlocated = insertWithOrder(next.unlocated);
                }

                qc.setQueryData<TaskList>(key, next);
            }

            return { prev, tempId };
        },

        onError: (error, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData<TaskList>(key, ctx.prev);
            if (!isForbiddenError(error)) console.error('Task create failed:', error);
        },

        onSuccess: (res, _vars, ctx) => {
            const realId = res?.data;
            if (!realId || !ctx?.tempId) return;

            const cur = qc.getQueryData<TaskList>(key);
            if (!cur) return;

            const replaced: TaskList = {
                ...cur,
                sections: (cur.sections ?? []).map((s) => ({
                    ...s,
                    tasks: s.tasks?.map((t) => (t.id === ctx.tempId ? ({ ...t, id: realId } as Task) : t)) ?? [],
                })),
                unlocated: (cur.unlocated ?? []).map((t) => (t.id === ctx.tempId ? ({ ...t, id: realId } as Task) : t)),
            };

            qc.setQueryData<TaskList>(key, replaced);
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: key });
        },

        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false;
            return failureCount < 3 && !isClientError(error);
        },
    });
};

export const useUpdateTask = (projectId?: string) => {
    const qc = useQueryClient()
    const key = qk.tasks(projectId)
    const handleError = useErrorHandler(projectId)

    return useMutation<void, Error, TaskUpdateInput, { prev?: TaskList }>({
        mutationKey: ['task-update', projectId],

        mutationFn: async (input) => {
            try {
                const patch = toPatch(input)

                if (input.type === 'rename' && !patch.name) {
                    throw new Error('Name cannot be empty')
                }

                await ProjectService.updateTask(input.id, patch)
            } catch (error) {
                handleError(error)
                throw error
            }
        },

        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: key })

            const prev = qc.getQueryData<TaskList>(key)
            if (!prev) return { prev }

            const next = mapAllTasks(prev, (t) =>
                t.id === input.id ? applyOptimistic(t, input) : t
            )

            qc.setQueryData<TaskList>(key, next)
            return { prev }
        },

        onError: (error, vars, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData<TaskList>(key, ctx.prev)
            }

            if (!isForbiddenError(error)) {
                console.error('Task update failed:', {
                    error: error.message,
                    taskId: vars.id,
                    type: vars.type,
                })
            }
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: key })
        },

        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false
            return failureCount < MAX_RETRY_COUNT && !isClientError(error)
        },
    })
}

type CreateSectionVars = {
    name: string;
    beforeId?: string | null;
    afterId?: string | null;
};

export const useCreateSectionAction = (projectId?: string) => {
    const qc = useQueryClient();
    const key = ['tasks', projectId] as const;

    return useMutation<
        CommonResponse<string>,           // server mengembalikan id section baru di `data`
        Error,
        CreateSectionVars,
        { prev?: TaskList; tempId?: string }
    >({
        mutationKey: ['section-create', projectId],
        mutationFn: async (vars) => {
            if (!projectId) throw new Error('Project ID is required');
            return ProjectService.addSection(projectId, { name: vars.name });
        },

        onMutate: async ({ name, beforeId = null, afterId = null }) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<TaskList>(key);
            const tempId = `tmp-sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

            if (prev) {
                // Salin state lama
                const next: TaskList = {
                    ...prev,
                    unlocated: prev.unlocated ?? [],
                    sections: [...(prev.sections ?? [])],
                };

                // Ketik kuat: ini adalah tipe item di dalam sections
                type SectionType = NonNullable<TaskList['sections']>[number];

                // Section baru dengan tipe yang tepat (tanpa any)
                const newSection: SectionType = {
                    id: tempId,
                    name,
                    tasks: [] as Task[],
                    // kalau SectionType punya properti lain, tambahkan default-nya di sini
                };

                // Sisipkan di posisi yang benar
                const ids = (next.sections ?? []).map(s => s.id);
                const ins = computeInsertIndex(ids, beforeId, afterId);

                // Pastikan sections “definitely assigned” dan ketik kuat
                const nextSections: NonNullable<TaskList['sections']> = [...(next.sections ?? [])];
                nextSections.splice(ins, 0, newSection);

                next.sections = nextSections;

                qc.setQueryData<TaskList>(key, next);
            }

            return { prev, tempId };
        },


        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData<TaskList>(key, ctx.prev);
            console.error('Section create failed');
        },

        onSuccess: (res, _vars, ctx) => {
            const realId = res?.data;
            if (!realId || !ctx?.tempId) return;

            const cur = qc.getQueryData<TaskList>(key);
            if (!cur) return;

            const replaced: TaskList = {
                ...cur,
                sections: (cur.sections ?? []).map((s) =>
                    s.id === ctx.tempId ? { ...s, id: realId } : s
                ),
            };

            qc.setQueryData<TaskList>(key, replaced);
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: key });
        },

        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false;
            return failureCount < 3 && !isClientError(error);
        },
    });
};

type DeleteSectionVars = {
    sectionId: string;
    includeTask: boolean;
};
export const useDeleteSectionAction = (projectId?: string) => {
    const qc = useQueryClient();
    const key = ['tasks', projectId] as const;

    return useMutation<
        CommonResponse<string>,
        Error,
        DeleteSectionVars,
        { prev?: TaskList }
    >({
        mutationKey: ['section-delete', projectId],
        mutationFn: async ({ sectionId, includeTask }) => {
            if (!projectId) throw new Error('Project ID is required');
            return ProjectService.deleteSection(projectId, { sectionId, includeTask });
        },

        onMutate: async ({ sectionId, includeTask }) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<TaskList>(key);
            if (!prev) return { prev };

            const next: TaskList = {
                unlocated: [...(prev.unlocated ?? [])],
                sections: [...(prev.sections ?? [])].map(s => ({
                    ...s,
                    tasks: [...(s.tasks ?? [])],
                })),
            };

            const idx = next.sections.findIndex(s => s.id === sectionId);
            if (idx === -1) return { prev };

            const targetSection = next.sections[idx];
            const sectionTasks = targetSection.tasks ?? [];

            if (!includeTask && sectionTasks.length > 0) {
                next.unlocated = [...next.unlocated, ...sectionTasks];
            }
            next.sections.splice(idx, 1);
            qc.setQueryData<TaskList>(key, next);
            return { prev };
        },
        onError: (error, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData<TaskList>(key, ctx.prev);
            if (!isForbiddenError(error)) {
                console.error('Section delete failed:', error);
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: key });
        },
        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false;
            return failureCount < MAX_RETRY_COUNT && !isClientError(error);
        },
    });
};

export const useUpdateSection = () => {
    const qc = useQueryClient()

    return useMutation<
        unknown,
        Error,
        { projectId: string; id: string; name: string },
        { prev?: TaskList; key?: readonly [string, string | undefined] }
    >({
        mutationKey: ['section-rename'],

        mutationFn: async ({ projectId, id, name }) => {
            const trimmed = name.trim()

            if (!projectId) throw new Error('Project ID is required')
            if (!trimmed) throw new Error('Name cannot be empty')

            return ProjectService.renameSection(projectId, id, trimmed)
        },

        onMutate: async ({ projectId, id, name }) => {
            const key = qk.tasks(projectId)
            await qc.cancelQueries({ queryKey: key })

            const prev = qc.getQueryData<TaskList>(key)
            const trimmed = name.trim()

            if (!prev || !trimmed) return { prev, key }

            const next: TaskList = {
                ...prev,
                sections: (prev.sections ?? []).map((s) =>
                    s.id === id ? { ...s, name: trimmed } : s
                ),
                unlocated: prev.unlocated ?? [],
            }

            qc.setQueryData<TaskList>(key, next)
            return { prev, key }
        },

        onError: (error, vars, ctx) => {
            if (ctx?.prev && ctx?.key) {
                qc.setQueryData<TaskList>(ctx.key, ctx.prev)
            }

            if (!isForbiddenError(error)) {
                console.error('Section rename failed:', {
                    error: error.message,
                    sectionId: vars.id,
                    projectId: vars.projectId,
                })
            }
        },

        onSettled: (_data, _err, vars) => {
            qc.invalidateQueries({ queryKey: qk.tasks(vars.projectId) })
        },

        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false
            return failureCount < MAX_RETRY_COUNT && !isClientError(error)
        },
    })
}

export function useMoveSection(projectId: string) {
    const qc = useQueryClient()
    const key = qk.tasks(projectId)
    const handleError = useErrorHandler(projectId)

    return useMutation<
        unknown,
        Error,
        { sectionId: string; payload: MoveSectionPayload },
        { prev?: TaskList }
    >({
        mutationKey: ['section-move', projectId],

        mutationFn: async ({ sectionId, payload }) => {
            try {
                return await ProjectService.moveSection(projectId, sectionId, payload)
            } catch (error) {
                handleError(error)
                throw error
            }
        },

        onMutate: async ({ sectionId, payload }) => {
            await qc.cancelQueries({ queryKey: key })
            const prev = qc.getQueryData<TaskList>(key)

            if (!prev) return { prev }

            const sections = prev.sections ? [...prev.sections] : []
            const fromIdx = sections.findIndex(s => s.id === sectionId)

            let rawToIdx = -1
            if (payload.beforeId != null) {
                rawToIdx = sections.findIndex(s => s.id === payload.beforeId)
            } else if (payload.afterId != null) {
                const j = sections.findIndex(s => s.id === payload.afterId)
                rawToIdx = j >= 0 ? j + 1 : -1
            }

            if (fromIdx !== -1 && rawToIdx !== -1) {
                const toIdx = fromIdx < rawToIdx ? rawToIdx - 1 : rawToIdx
                const nextSections = moveInArray(sections, fromIdx, toIdx)
                const next: TaskList = { ...prev, sections: nextSections }
                qc.setQueryData<TaskList>(key, next)
            }

            return { prev }
        },

        onError: (error, vars, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData<TaskList>(key, ctx.prev)
            }

            if (!isForbiddenError(error)) {
                console.error('Section move failed:', {
                    error: error.message,
                    sectionId: vars.sectionId,
                    projectId,
                })
            }
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: key })
        },

        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false
            return failureCount < MAX_RETRY_COUNT && !isClientError(error)
        },
    })
}

export function useMoveTask(projectId: string) {
    const qc = useQueryClient()
    const key = qk.tasks(projectId)
    const handleError = useErrorHandler(projectId)

    return useMutation<
        CommonResponse<{ id: string; id_dt_section: string | null; rank?: string }>,
        Error,
        { taskId: string; payload: MoveTaskPayload },
        { prev?: TaskList }
    >({
        mutationKey: ['task-move', projectId],

        mutationFn: async ({ taskId, payload }) => {
            try {
                return await ProjectService.moveTask(projectId, taskId, payload)
            } catch (error) {
                handleError(error)
                throw error
            }
        },

        onMutate: async ({ taskId, payload }) => {
            await qc.cancelQueries({ queryKey: key })
            const prev = qc.getQueryData<TaskList>(key)

            if (!prev) return { prev }

            const next: TaskList = {
                unlocated: [...(prev.unlocated ?? [])],
                sections: (prev.sections ?? []).map(s => ({
                    ...s,
                    tasks: [...(s.tasks ?? [])]
                })),
            }

            let moving: Task | null = null
            let originSectionId: string | null = null

            const idxU = next.unlocated.findIndex(t => t.id === taskId)
            if (idxU !== -1) {
                moving = next.unlocated[idxU]
                next.unlocated.splice(idxU, 1)
                originSectionId = null
            }

            if (!moving) {
                for (const s of next.sections) {
                    const i = s.tasks.findIndex(t => t.id === taskId)
                    if (i !== -1) {
                        moving = s.tasks[i]
                        s.tasks.splice(i, 1)
                        originSectionId = s.id
                        break
                    }
                }
            }

            if (!moving) {
                console.warn('Task not found for move:', taskId)
                return { prev }
            }

            const {
                targetSectionId,
                beforeId: rawBeforeId = null,
                afterId: rawAfterId = null
            } = payload

            const beforeId = rawBeforeId === taskId ? null : rawBeforeId
            const afterId = rawAfterId === taskId ? null : rawAfterId

            const insertWithOrder = (list: Task[]) => {
                const ids = list.map(t => t.id)
                const ins = computeInsertIndex(ids, beforeId, afterId)
                return insertAt(list, ins, moving as Task)
            }

            const isInPlace =
                targetSectionId !== null &&
                originSectionId !== null &&
                targetSectionId === originSectionId

            if (targetSectionId === null) {
                next.unlocated = insertWithOrder(next.unlocated)
            } else if (isInPlace) {
                const sec = next.sections.find(s => s.id === originSectionId)
                if (sec) {
                    sec.tasks = insertWithOrder(sec.tasks)
                } else {
                    next.unlocated = insertWithOrder(next.unlocated)
                }
            } else {
                const target = next.sections.find(s => s.id === targetSectionId)
                if (target) {
                    target.tasks = insertWithOrder(target.tasks)
                } else {
                    next.unlocated = insertWithOrder(next.unlocated)
                }
            }

            qc.setQueryData<TaskList>(key, next)
            return { prev }
        },

        onError: (error, vars, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData<TaskList>(key, ctx.prev)
            }

            if (!isForbiddenError(error)) {
                console.error('Task move failed:', {
                    error: error.message,
                    taskId: vars.taskId,
                    projectId,
                })
            }
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: key })
        },

        retry: (failureCount, error) => {
            if (isForbiddenError(error)) return false
            return failureCount < MAX_RETRY_COUNT && !isClientError(error)
        },
    })
}

//task-detail
export const useAddSubTask = (projectId: string, taskId: string) => {
    const qc = useQueryClient()
    const keyList   = qk.tasks(projectId)
    const keyDetail = qk.task(projectId, taskId)
    const handleError = useErrorHandler(projectId)

    return useMutation<
        CommonResponse<{ id: string }>,
        Error,
        AddSubTaskRequest,
        { prevList?: TaskList; prevDetail?: Task | undefined; tempId?: string }
    >({
        mutationKey: ['subtask-add', projectId, taskId],
        mutationFn: async (payload) => {
            try {
                return await ProjectService.addSubTask(taskId, payload)
            } catch (error) {
                handleError(error); throw error
            }
        },
        onMutate: async (payload) => {
            qc.cancelQueries({ queryKey: keyList })

            const prevList   = qc.getQueryData<TaskList>(keyList)
            const prevDetail = qc.getQueryData<Task>(keyDetail)

            if (!prevList) return { prevList, prevDetail }

            // clone aman
            const next: TaskList = {
                unlocated: [...(prevList.unlocated ?? [])],
                sections: (prevList.sections ?? []).map(s => ({
                    ...s,
                    tasks: (s.tasks ?? []).map(t => ({ ...t, subTask: [...(t.subTask ?? [])] })),
                })),
            }

            const allTasks = [
                ...(next.unlocated ?? []),
                ...(next.sections ?? []).flatMap(s => s.tasks ?? []),
            ]
            const t = allTasks.find(t => t.id === taskId)
            if (!t) return { prevList, prevDetail }

            const tempId = `tmp-sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            const optimistic: NonNullable<Task['subTask']>[number] = {
                id: tempId,
                name: payload.name,
                status: false,
                dueDate: null,
            }

            t.subTask = [...(t.subTask ?? []), optimistic]
            qc.setQueryData<TaskList>(keyList, next)

            if (prevDetail) {
                qc.setQueryData<Task>(keyDetail, {
                    ...prevDetail,
                    subTask: [...(prevDetail.subTask ?? []), optimistic],
                })
            }

            return { prevList, prevDetail, tempId }
        },
        onError: (_e, _vars, ctx) => {
            if (ctx?.prevList)   qc.setQueryData<TaskList>(keyList, ctx.prevList)
            if (ctx?.prevDetail) qc.setQueryData<Task>(keyDetail, ctx.prevDetail)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: keyList })
            qc.invalidateQueries({ queryKey: keyDetail })
        },
    })
}

export const useUpdateSubTask = (projectId: string) => {
    const qc = useQueryClient()
    const keyList = qk.tasks(projectId)
    const handleError = useErrorHandler(projectId)

    return useMutation<
        CommonResponse<unknown>,
        Error,
        { taskId: string; subtaskId: string; payload: UpdateSubTaskRequest },
        { prevList?: TaskList; prevDetail?: Task | undefined }
    >({
        mutationKey: ['subtask-update', projectId],
        mutationFn: async ({ subtaskId, payload }) => {
            try {
                return await ProjectService.updateSubTask(subtaskId, payload)
            } catch (error) {
                handleError(error); throw error
            }
        },
        onMutate: async ({ taskId, subtaskId, payload }) => {
            qc.cancelQueries({ queryKey: keyList })

            const prevList   = qc.getQueryData<TaskList>(keyList)
            const prevDetail = qc.getQueryData<Task>(qk.task(projectId, taskId))

            if (prevList) {
                const next: TaskList = {
                    unlocated: [...(prevList.unlocated ?? [])],
                    sections: (prevList.sections ?? []).map(s => ({
                        ...s,
                        tasks: (s.tasks ?? []).map(t =>
                            t.id === taskId
                                ? { ...t, subTask: (t.subTask ?? []).map(st => st.id === subtaskId ? { ...st, ...payload } : st) }
                                : t
                        ),
                    })),
                }
                qc.setQueryData<TaskList>(keyList, next)
            }

            if (prevDetail) {
                const nextDetail: Task = {
                    ...prevDetail,
                    subTask: (prevDetail.subTask ?? []).map(st =>
                        st.id === subtaskId ? { ...st, ...payload } : st
                    ),
                }
                qc.setQueryData<Task>(qk.task(projectId, taskId), nextDetail)
            }

            return { prevList, prevDetail }
        },
        onError: (_e, vars, ctx) => {
            if (ctx?.prevList)   qc.setQueryData<TaskList>(keyList, ctx.prevList)
            if (ctx?.prevDetail) qc.setQueryData<Task>(qk.task(projectId, vars.taskId), ctx.prevDetail)
        },
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: keyList })
            qc.invalidateQueries({ queryKey: qk.task(projectId, vars.taskId) })
        },
    })
}

export const useDeleteSubTask = (projectId: string) => {
    const qc = useQueryClient()
    const keyList = qk.tasks(projectId)
    const handleError = useErrorHandler(projectId)

    return useMutation<
        CommonResponse<null>,
        Error,
        { taskId: string; subtaskId: string },
        { prevList?: TaskList; prevDetail?: Task | undefined }
    >({
        mutationKey: ['subtask-delete', projectId],
        mutationFn: async ({ subtaskId }) => {
            try {
                return await ProjectService.deleteSubTask(subtaskId)
            } catch (error) {
                handleError(error); throw error
            }
        },
        onMutate: async ({ taskId, subtaskId }) => {
            qc.cancelQueries({ queryKey: keyList })

            const prevList   = qc.getQueryData<TaskList>(keyList)
            const prevDetail = qc.getQueryData<Task>(qk.task(projectId, taskId))

            if (prevList) {
                const next: TaskList = {
                    unlocated: [...(prevList.unlocated ?? [])],
                    sections: (prevList.sections ?? []).map(s => ({
                        ...s,
                        tasks: (s.tasks ?? []).map(t =>
                            t.id === taskId
                                ? { ...t, subTask: (t.subTask ?? []).filter(d => d.id !== subtaskId) }
                                : t
                        ),
                    })),
                }
                qc.setQueryData<TaskList>(keyList, next)
            }

            if (prevDetail) {
                const nextDetail: Task = {
                    ...prevDetail,
                    subTask: (prevDetail.subTask ?? []).filter(d => d.id !== subtaskId),
                }
                qc.setQueryData<Task>(qk.task(projectId, taskId), nextDetail)
            }

            return { prevList, prevDetail }
        },
        onError: (_e, vars, ctx) => {
            if (ctx?.prevList)   qc.setQueryData<TaskList>(keyList, ctx.prevList)
            if (ctx?.prevDetail) qc.setQueryData<Task>(qk.task(projectId, vars.taskId), ctx.prevDetail)
        },
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: keyList })
            qc.invalidateQueries({ queryKey: qk.task(projectId, vars.taskId) })
        },
    })
}

export function useMoveSubTask(projectId: string) {
    const qc = useQueryClient()
    const keyList = qk.tasks(projectId)
    const handleError = useErrorHandler(projectId)

    return useMutation<
        CommonResponse<{ id: string; rank?: string }>,
        Error,
        { taskId: string; subtaskId: string; payload: MoveSubTaskPayload },
        { prevList?: TaskList; prevDetail?: Task | undefined; keyDetail?: readonly unknown[] }
    >({
        mutationKey: ['subtask-move', projectId],
        mutationFn: async ({ subtaskId, payload }) => {
            try {
                return await ProjectService.moveSubTask(subtaskId, payload)
            } catch (err) { handleError(err); throw err }
        },

        async onMutate({ taskId, subtaskId, payload }) {
            // ✅ cancel keduanya & di-await
            const keyDetail = qk.task(projectId, taskId)
            await Promise.all([
                qc.cancelQueries({ queryKey: keyList }),
                qc.cancelQueries({ queryKey: keyDetail }),
            ])

            const prevList   = qc.getQueryData<TaskList>(keyList)
            const prevDetail = qc.getQueryData<Task>(keyDetail)

            const applyReorder = (subTasks: NonNullable<Task['subTask']>) => {
                const fromIdx = subTasks.findIndex(st => st.id === subtaskId)
                if (fromIdx < 0) return subTasks

                const moving = subTasks[fromIdx]
                const rest   = [...subTasks.slice(0, fromIdx), ...subTasks.slice(fromIdx + 1)]

                const rawB = payload.beforeId ?? null
                const rawA = payload.afterId  ?? null
                const beforeId = rawB === subtaskId ? null : rawB
                const afterId  = rawA === subtaskId ? null : rawA

                const ids = rest.map(s => s.id)
                const insertIdx = computeInsertIndex(ids, beforeId, afterId)
                return insertAt(rest, insertIdx, moving)
            }

            if (prevList) {
                const next: TaskList = {
                    unlocated: [...(prevList.unlocated ?? [])],
                    sections: (prevList.sections ?? []).map(s => ({
                        ...s,
                        tasks: (s.tasks ?? []).map(t =>
                            t.id === taskId && t.subTask
                                ? { ...t, subTask: applyReorder(t.subTask) }
                                : t
                        ),
                    })),
                }
                qc.setQueryData<TaskList>(keyList, next)
            }

            if (prevDetail?.subTask) {
                qc.setQueryData<Task>(keyDetail, { ...prevDetail, subTask: applyReorder(prevDetail.subTask) })
            }

            return { prevList, prevDetail, keyDetail }
        },

        onError(_e, _vars, ctx) {
            if (ctx?.prevList)   qc.setQueryData<TaskList>(keyList, ctx.prevList)
            if (ctx?.prevDetail && ctx?.keyDetail) qc.setQueryData<Task>(ctx.keyDetail, ctx.prevDetail)
        },

        onSuccess(res, vars) {
            // (Opsional) kalau server kirim rank terbaru, bisa merge di cache di sini.
            qc.invalidateQueries({ queryKey: keyList })
            qc.invalidateQueries({ queryKey: qk.task(projectId, vars.taskId) })
        },

        retry: (n, err) => !isForbiddenError(err) && n < MAX_RETRY_COUNT && !isClientError(err),
    })
}




