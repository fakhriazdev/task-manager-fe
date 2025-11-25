'use client'

import {useCallback, useEffect, useMemo, useState,} from 'react'
import {closestCenter, DndContext, DragOverlay, MeasuringStrategy,} from '@dnd-kit/core'
import {SortableContext, verticalListSortingStrategy,} from '@dnd-kit/sortable'

import { TableProject } from '@/components/ui/project/table-project'
import { TaskTableHead } from './TaskTableHead'
import {SectionTBody, type SectionVM,} from '@/app/dashboard/projects/[id]/list/component/ui/section/SectionTBody'
import { UnlocatedTBody } from '@/app/dashboard/projects/[id]/list/component/ui/rows/UnlocatedTBody'
import AddSection from '@/app/dashboard/projects/[id]/list/component/ui/section/AddSection'
import {SectionGhost, TaskGhost,} from '@/app/dashboard/projects/[id]/list/component/ui/rows/RowGhost'
import { Task } from '@/lib/project/projectTypes'
import { useProjectPermission } from '@/hooks/useProjectPermission'
import {useMoveSection, useMoveTask, useProjectTasksAction,} from '@/lib/project/projectAction'
import { adjustForScroll } from '@/utils/adjustForScroll'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ListFilter } from 'lucide-react'
import {useFilteredTable, type DueFilterMode,} from '@/app/dashboard/projects/[id]/list/component/FilteredTable'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'
import {useTaskTableDnd} from "@/hooks/useTableDnd";

/* =========================
   Constants & Helpers
   ========================= */
const UNLOCATED_ID = 'unlocated' as const
const LS_COLLAPSE_KEY = 'task_sections_collapsed'

function readCollapsedFromLS(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
        const raw = localStorage.getItem(LS_COLLAPSE_KEY)
        if (!raw) return new Set()
        const arr = JSON.parse(raw)
        return Array.isArray(arr) && arr.every((x) => typeof x === 'string')
            ? new Set(arr)
            : new Set()
    } catch {
        return new Set()
    }
}

function writeCollapsedToLS(ids: Set<string>) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(LS_COLLAPSE_KEY, JSON.stringify([...ids]))
    } catch {
        // ignore
    }
}

type TaskTableViewProps = {
    projectId: string
}

export default function TaskTableView({ projectId }: TaskTableViewProps) {
    const { data: taskList, isLoading, error } = useProjectTasksAction(projectId)
    const moveSectionMutation = useMoveSection(projectId ?? '')
    const moveTaskMutation = useMoveTask(projectId ?? '')
    const { user } = useAuthStore()
    const { hasAccess } = useProjectPermission(projectId, ['OWNER', 'EDITOR'])

    const [sections, setSections] = useState<SectionVM[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [collapsed, setCollapsed] = useState<Set<string>>(
        () => readCollapsedFromLS(),
    )

    useEffect(() => {
        if (!taskList) return

        const apiSections: SectionVM[] = taskList.sections.map((s) => ({
            id: s.id,
            name: s.name,
        }))

        const apiTasks: Task[] = [
            ...(taskList.unlocated?.map((t) => ({
                id: t.id,
                name: t.name,
                desc: t.desc,
                dueDate: t.dueDate,
                section: UNLOCATED_ID,
                creator: t.creator,
                status: t.status,
                assignees: t.assignees,
                subTask: t.subTask,
            })) ?? []),
            ...taskList.sections.flatMap((s) =>
                (s.tasks ?? []).map((t) => ({
                    id: t.id,
                    name: t.name,
                    desc: t.desc,
                    dueDate: t.dueDate,
                    section: s.id,
                    creator: t.creator,
                    status: t.status,
                    assignees: t.assignees,
                    subTask: t.subTask,
                })),
            ),
        ]

        setSections(apiSections)
        setTasks(apiTasks)
    }, [taskList])

    useEffect(() => {
        writeCollapsedToLS(collapsed)
    }, [collapsed])

    useEffect(() => {
        if (!sections?.length) return
        const valid = new Set(sections.map((s) => s.id))
        setCollapsed((prev) => {
            let changed = false
            const next = new Set<string>()
            prev.forEach((id) => {
                if (valid.has(id)) next.add(id)
                else changed = true
            })
            return changed ? next : prev
        })
    }, [sections])

    const onToggle = useCallback((id: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const {
        sensors,
        rootRef,
        viewportEl,
        activeTask,
        activeSection,
        sortableItems,
        isDraggingTask,
        disableDropForSections,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
    } = useTaskTableDnd({
        tasks,
        sections,
        setTasks,
        setSections,
        unlocatedId: UNLOCATED_ID,
        moveSection: ({ sectionId, beforeId, afterId }) =>
            moveSectionMutation.mutate({
                sectionId,
                payload: { beforeId, afterId },
            }),
        moveTask: ({ taskId, targetSectionId, beforeId, afterId }) =>
            moveTaskMutation.mutate({
                taskId,
                payload: { targetSectionId, beforeId, afterId },
            }),
    })

    /* =========================
       Filter hook
       ========================= */
    const {
        setFilter,
        status,
        onlyMine,
        due,
        toggleFilter,
        grouped,
        unlocatedTasks,
    } = useFilteredTable({
        tasks,
        sections,
        currentUserId: user!.nik,
    })


    const showUnlocated = useMemo(() => unlocatedTasks.length > 0 || isDraggingTask,
        [unlocatedTasks.length, isDraggingTask],
    )

    const sectionRows = useMemo(() => sections.map((sec) => (
                <SectionTBody
                    key={sec.id}
                    projectId={projectId}
                    section={sec}
                    tasks={grouped[sec.id] ?? []}
                    disableDrop={disableDropForSections}
                    collapsed={collapsed.has(sec.id)}
                    onToggle={onToggle}
                    isDraggingTask={isDraggingTask}
                />
            )),
        [
            sections,
            projectId,
            grouped,
            disableDropForSections,
            collapsed,
            onToggle,
            isDraggingTask,
        ],
    )

    const filtersActive = useMemo(
        () =>
            (status !== 'all' ? 1 : 0) +
            (onlyMine ? 1 : 0) +
            (due !== 'any' ? 1 : 0),
        [status, onlyMine, due],
    )

    // supaya Select onValueChange nggak pakai any
    const handleDueChange = (value: string) => {
        if (
            value === 'any' ||
            value === 'this_week' ||
            value === 'next_week' ||
            value === 'this_month'
        ) {
            setFilter((prev) => ({
                ...prev,
                due: value as DueFilterMode,
            }))
        }
    }

    /* =========================
       UI states
       ========================= */
    if (isLoading)
        return (
            <div className="p-4 text-sm text-muted-foreground">
                Loading tasks...
            </div>
        )
    if (error)
        return (
            <div className="p-4 text-sm text-red-500">
                Failed to load tasks
            </div>
        )

    const table = (
        <div ref={rootRef} className="relative w-full">
            {/* Header filter sticky */}
            <div className="sticky z-30 top-32">
                <div className="w-full bg-background justify-end flex gap-2 py-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="border-none h-6 px-2 text-muted-foreground gap-1"
                            >
                                <ListFilter className="h-3 w-3" />
                                <span className="text-sm tracking-wide">Filter</span>
                                {filtersActive > 0 && (
                                    <span className="text-[10px] rounded-full bg-primary/10 px-1.5">
                    {filtersActive}
                  </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="max-w-96 max-h-72 overflow-y-auto"
                            align="end"
                        >
                            <DropdownMenuLabel>Filter</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup className="flex flex-wrap gap-3 w-full m-2">
                                {/* Tugas yang belum selesai */}
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        toggleFilter('status', 'not_done')
                                    }}
                                    className={`rounded-full border h-8 px-3 text-xs ${
                                        status === 'not_done'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    Tugas yang belum selesai
                                </DropdownMenuItem>

                                {/* Tugas yang selesai */}
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        toggleFilter('status', 'done')
                                    }}
                                    className={`rounded-full border h-8 px-3 text-xs ${
                                        status === 'done'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    Tugas yang selesai
                                </DropdownMenuItem>

                                {/* Hanya tugas saya */}
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        toggleFilter('onlyMine')
                                    }}
                                    className={`rounded-full border h-8 px-3 text-xs ${
                                        onlyMine
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    Hanya tugas saya
                                </DropdownMenuItem>

                                {/* Masuk tenggat + dropdown mode */}
                                <div className="flex items-center gap-2">
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault()
                                            setFilter((prev) => ({
                                                ...prev,
                                                due: prev.due === 'any' ? 'this_week' : 'any',
                                            }))
                                        }}
                                        className={`rounded-full border h-8 px-3 text-xs ${
                                            due !== 'any'
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        Masuk tenggat
                                    </DropdownMenuItem>

                                    <Select value={due} onValueChange={handleDueChange}>
                                        <SelectTrigger
                                            className="h-8 w-[130px] text-xs"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <SelectValue placeholder="Pilih rentang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Semua tanggal</SelectItem>
                                            <SelectItem value="this_week">Minggu ini</SelectItem>
                                            <SelectItem value="next_week">Minggu depan</SelectItem>
                                            <SelectItem value="this_month">Bulan ini</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>Team</DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <TableProject>
                <TaskTableHead />
                {showUnlocated && (
                    <UnlocatedTBody
                        projectId={projectId}
                        tasks={unlocatedTasks}
                        disableDrop={disableDropForSections}
                        isDraggingTask={isDraggingTask}
                    />
                )}
                {sectionRows}
                {hasAccess && <AddSection projectId={projectId} colSpan={4} />}
            </TableProject>
        </div>
    )

    /* =========================
       Render with DnD wrapper
       ========================= */
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            autoScroll={{
                enabled: true,
                threshold: { x: 0.2, y: 0.2 },
            }}
            modifiers={[adjustForScroll(() => viewportEl)]}
        >
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                {table}
            </SortableContext>

            <DragOverlay dropAnimation={null}>
                {activeTask ? (
                    <TaskGhost
                        name={activeTask.name}
                        assignees={
                            Array.isArray(activeTask.assignees) ? activeTask.assignees : []
                        }
                        creator={activeTask.creator}
                    />
                ) : activeSection ? (
                    <SectionGhost
                        title={activeSection.name}
                        count={grouped[activeSection.id]?.length ?? 0}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
