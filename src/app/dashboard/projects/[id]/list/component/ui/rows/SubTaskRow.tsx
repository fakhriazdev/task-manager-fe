'use client'

import React, {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
    type CSSProperties,
} from 'react'
import {TableRow, TableCell} from '@/components/ui/table'
import {
    DndContext,
    type DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {GripVertical, CircleCheck} from 'lucide-react'
import {
    useMoveSubTask,
    useUpdateSubTask,
    useSyncSubTaskAssigneesAction,
} from '@/lib/project/projectAction'
import {useDebouncedCallback} from '@/hooks/useDebouncedCallback'
import type {SubTask} from '@/lib/project/projectTypes'
import {cn, formatDateTime2, isOverdue} from '@/lib/utils'
import {Assignees} from "@/app/dashboard/projects/[id]/list/types/task";
import {useProjectPermission} from "@/hooks/useProjectPermission";
import AssigneePicker from "@/app/dashboard/projects/[id]/list/component/AssigneePicker";


type Props = {
    projectId: string,
    taskId: string,
    membersTask: Assignees[],
    subtasks: SubTask[],
}

export default function SubTaskRow({projectId, taskId, subtasks, membersTask}: Props) {
    const [localSubtasks, setLocalSubtasks] = useState(subtasks)
    const {mutate: moveSubTask} = useMoveSubTask(projectId)

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 2}}),
    )

    const prevSubtasksRef = useRef(subtasks)
    useEffect(() => {
        if (JSON.stringify(prevSubtasksRef.current) !== JSON.stringify(subtasks)) {
            setLocalSubtasks(subtasks)
            prevSubtasksRef.current = subtasks
        }
    }, [subtasks])

    const renameLocal = useCallback((id: string, name: string) => {
        setLocalSubtasks(prev => prev.map(s => (s.id === id ? {...s, name} : s)))
    }, [])

    const toggleStatusLocal = useCallback((id: string, next: boolean) => {
        setLocalSubtasks(prev => prev.map(s => (s.id === id ? {...s, status: next} : s)))
    }, [])

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const {active, over} = event
            if (!active?.id || !over?.id || active.id === over.id) return

            setLocalSubtasks(prev => {
                const ai = prev.findIndex(t => t.id === active.id)
                const oi = prev.findIndex(t => t.id === over.id)
                if (ai === -1 || oi === -1) return prev

                const previous = prev
                const reordered = arrayMove(prev, ai, oi)

                const newIdx = oi
                const beforeId = newIdx > 0 ? reordered[newIdx - 1]?.id ?? null : null
                const afterId =
                    newIdx < reordered.length - 1 ? reordered[newIdx + 1]?.id ?? null : null

                moveSubTask(
                    {taskId, subtaskId: String(active.id), payload: {beforeId, afterId}},
                    {
                        onError: (err) => {
                            console.error('Move subtask failed:', err)
                            setLocalSubtasks(previous)
                        },
                    },
                )

                return reordered
            })
        },
        [moveSubTask, taskId],
    )

    const subtaskIds = useMemo(() => localSubtasks.map(s => s.id), [localSubtasks])

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={subtaskIds} strategy={verticalListSortingStrategy}>
                {localSubtasks.map(sub => (
                    <SubTaskRowItem
                        key={sub.id}
                        projectId={projectId}
                        taskId={taskId}
                        subtask={sub}
                        onRename={renameLocal}
                        onToggleStatus={toggleStatusLocal}
                        membersTask={membersTask}
                    />
                ))}
            </SortableContext>
        </DndContext>
    )
}

function SubTaskRowItem({
                            projectId,
                            taskId,
                            subtask,
                            onRename,
                            onToggleStatus,
                            membersTask,
                        }: {
    projectId: string
    taskId: string
    subtask: SubTask
    onRename: (id: string, name: string) => void
    onToggleStatus: (id: string, next: boolean) => void
    membersTask?: Assignees[]
}) {
    const {
        setNodeRef,
        transform,
        transition,
        attributes,
        listeners,
        setActivatorNodeRef,
        isDragging,
    } = useSortable({id: subtask.id})


    const {mutate: updateSubtask} = useUpdateSubTask(projectId)

    const style: CSSProperties = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        }),
        [transform, transition, isDragging],
    )

    const [editing, setEditing] = useState(false)
    const [tempName, setTempName] = useState(subtask.name)
    const inputRef = useRef<HTMLInputElement>(null)
    const { hasAccess } = useProjectPermission(projectId, ['OWNER', 'EDITOR',])
    const syncAssigneeMut = useSyncSubTaskAssigneesAction(projectId);
    const [localAssignees, setLocalAssignees] = useState<Assignees[]>(subtask.assignees ?? []);

    useEffect(() => {
        setLocalAssignees(subtask.assignees ?? []);
    }, [subtask.assignees]);
    useEffect(() => {
        setLocalAssignees(subtask.assignees ?? [])
    }, [subtask.assignees])
    const debouncedSave = useDebouncedCallback(
        (taskIdArg: string, id: string, name: string) => {
            const n = name.trim()
            if (!n) return
            updateSubtask(
                {taskId: taskIdArg, subtaskId: id, payload: {name: n}},
                {
                    onError: (err) => {
                        console.error('Rename failed:', err)
                        onRename(id, subtask.name)
                    },
                },
            )
        },
        400,
    )

    useEffect(() => {
        if (!editing) setTempName(subtask.name)
    }, [subtask.name, editing])

    useEffect(() => {
        if (!editing) return
        const t = setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.select()
        }, 60)
        return () => clearTimeout(t)
    }, [editing])

    useEffect(() => () => debouncedSave.cancel?.(), [debouncedSave])

    const commitRename = useCallback(
        (newName: string) => {
            const trimmed = newName.trim()
            if (!trimmed || trimmed === subtask.name) {
                setEditing(false)
                setTempName(subtask.name)
                return
            }
            onRename(subtask.id, trimmed) // optimistic
            setEditing(false)
            debouncedSave(taskId, subtask.id, trimmed) // api
        },
        [debouncedSave, onRename, subtask.id, subtask.name, taskId],
    )

    const handleToggleStatus = useCallback(() => {
        const next = !subtask.status
        onToggleStatus(subtask.id, next) // optimistic
        updateSubtask(
            {taskId, subtaskId: subtask.id, payload: {status: next}},
            {
                onError: (err) => {
                    console.error('Toggle status failed:', err)
                    onToggleStatus(subtask.id, !next) // rollback
                },
            },
        )
    }, [onToggleStatus, subtask.id, subtask.status, taskId, updateSubtask])
    const handleAssigneesChange = useCallback(
        (next: Assignees[]) => {
            if (!hasAccess) return;

            // ✅ update UI lokal dulu (biar berasa responsive)
            setLocalAssignees(next);

            // ✅ kirim ke backend: cuma butuh nik
            const payload = next.map(a => ({ nik: a.nik.trim() }));

            syncAssigneeMut.mutate({
                taskId,
                subtaskId: subtask.id,
                assignees: payload,
            });
        },
        [hasAccess, syncAssigneeMut, taskId, subtask.id],
    );


    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={cn(
                "select-none h-10 hover:bg-muted/40",
                // garis horizontal
                "border-b border-foreground/15 last:border-b-0",
                // garis vertikal di setiap kolom kecuali yang terakhir
                "[&>td:not(:last-child)]:border-r [&>td:not(:last-child)]:border-foreground/15"
            )}
        >
            <TableCell colSpan={2} className="p-2 border-l border-border first:border-l-0">
                <div className="h-full flex items-center gap-2 group/item">
                    <button
                        ref={setActivatorNodeRef}
                        {...(!editing ? {...attributes, ...listeners} : {})}
                        type="button"
                        aria-label="Drag subtask"
                        style={{touchAction: 'none'}}
                        className={cn(
                            'shrink-0 rounded p-0.5 mr-10 text-muted-foreground hover:text-foreground hover:bg-transparent',
                            'cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',

                            // hidden by default; show on row hover/focus
                            'opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:pointer-events-auto',
                            'focus:opacity-100 focus:pointer-events-auto',

                            // while dragging, always visible
                            isDragging && 'opacity-100 pointer-events-auto',

                            // opsional: di mobile (<md) selalu terlihat
                            'md:opacity-0 md:pointer-events-none md:group-hover/item:opacity-100 md:group-hover/item:pointer-events-auto',
                            editing && 'opacity-40 cursor-not-allowed'
                        )}
                        disabled={editing}
                    >
                        <GripVertical size={14}/>
                    </button>


                    <button
                        onClick={handleToggleStatus}
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            subtask.status
                                ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600'
                                : ' border-dashed border-muted-foreground/60 hover:border-emerald-500 hover:bg-emerald-500/10'
                        }`}
                        aria-pressed={!!subtask.status}
                        aria-label={subtask.status ? 'Tandai belum selesai' : 'Tandai selesai'}
                        type="button"
                    >
                        {subtask.status && <CircleCheck
                            className={cn(
                                'w-4 h-4 text-black dark:text-white',
                                subtask.status
                                    ? 'border-emerald-500 hover:border-emerald-600'
                                    : 'border-dashed border-muted-foreground/60 hover:border-emerald-500 hover:text-emerald-600',
                            )}
                            aria-hidden
                        />}
                    </button>

                    {editing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={() => commitRename(tempName)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename(tempName)
                                if (e.key === 'Escape') {
                                    setTempName(subtask.name)
                                    setEditing(false)
                                }
                            }}
                            className="bg-secondary rounded px-2 py-1 text-sm flex-1 focus:ring-2 focus:ring-primary/40"
                        />
                    ) : (
                        <span
                            onClick={() => setEditing(true)}
                            className={`text-sm font-semibold truncate cursor-text flex-1 ${subtask.status ? 'text-muted-foreground/80' : 'text-primary'}`}
                            title={subtask.name}
                        >
              {subtask.name}
            </span>
                    )}
                </div>
            </TableCell>

            <TableCell className="p-0 border-l border-border">
                <AssigneePicker
                    hasAccess={hasAccess}
                    currentMembers={localAssignees}
                    members={membersTask ?? []}
                    onChange={handleAssigneesChange}
                    disabled={syncAssigneeMut.isPending}
                />
            </TableCell>

            <TableCell className="text-xs font-semibold text-center item-center p-0 border-l border-border">
                {subtask?.dueDate ? (
                    <p
                        className={cn(
                            'text-xs',
                            isOverdue(subtask.dueDate) && 'text-red-500'
                        )}
                    >
                        {formatDateTime2(subtask.dueDate)}
                    </p>
                ) : '-'}
            </TableCell>

            <TableCell className="p-0 border-l border-border">
                <div className="h-full py-1 px-2"/>
            </TableCell>
        </TableRow>
    )
}
