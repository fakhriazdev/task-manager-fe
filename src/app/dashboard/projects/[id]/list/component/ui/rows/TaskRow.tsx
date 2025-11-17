'use client'

import React, {
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    ChevronRight,
    ChevronDown,
    GripVertical,
    ListTree, Check,
} from 'lucide-react'
import { initials } from '../../../types/TaskTable.const'
import {useProjectDetailAction, useUpdateTask} from '@/lib/project/projectAction'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { useProjectStore } from '@/lib/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import type { Task } from '@/lib/project/projectTypes'
import SubTaskRow from '@/app/dashboard/projects/[id]/list/component/ui/rows/SubTaskRow'
import {cn, formatDateTime2, isOverdue} from '@/lib/utils'
import AssigneePicker from "@/app/dashboard/projects/[id]/list/component/AssigneePicker";
import {useProjectPermission} from "@/hooks/useProjectPermission";

export type TaskTRProps = {
    task: Task
    projectId: string        // wajib → jaga key React Query konsisten
    disableDrag?: boolean
}

export const TaskRow = memo(function TaskRow({ task, projectId, disableDrag }: TaskTRProps) {
        const {
            setNodeRef,
            transform,
            transition,
            isDragging,
            attributes,
            listeners,
            setActivatorNodeRef,
        } = useSortable({ id: task.id, disabled: !!disableDrag })
        const setOpen = useProjectStore((s) => s.setOpen)
        const setCurrentRow = useProjectStore((s) => s.setCurrentRow)
        const { hasAccess } = useProjectPermission(projectId, ['OWNER', 'EDITOR',])
        const style: React.CSSProperties = {
            transform: CSS.Transform.toString(transform),
            transition,
            willChange: isDragging ? 'transform' : 'auto',
        }

        const [editing, setEditing] = useState(false)
        const [tempName, setTempName] = useState(task.name)
        const inputRef = useRef<HTMLInputElement>(null)

        const committedNameRef = useRef(task.name)
        const pendingSaveRef = useRef<string | null>(null)

        const { mutate: updateTask } = useUpdateTask(projectId)
        const debouncedSave = useDebouncedCallback<[string, string]>((id, name) => {
            pendingSaveRef.current = name
            updateTask({ type: 'rename', id, name })
        }, 500)

        useEffect(() => {
            // Sinkron nama dari server bila tidak ada rename pending
            if (!editing && pendingSaveRef.current === null && task.name !== committedNameRef.current) {
                committedNameRef.current = task.name
                setTempName(task.name)
            }
            // Clear pending bila server sudah mengembalikan nama yang sama
            if (pendingSaveRef.current === task.name) {
                pendingSaveRef.current = null
                committedNameRef.current = task.name
            }
        }, [task.name, editing])
        useEffect(() => () => debouncedSave.cancel?.(), [debouncedSave])

        const handleNameChange = useCallback(
            (val: string) => {
                setTempName(val)
                const trimmed = val.trim()
                if (trimmed && trimmed !== committedNameRef.current) {
                    debouncedSave(task.id, trimmed)
                }
            },
            [debouncedSave, task.id],
        )

        const commit = useCallback(() => {
            const trimmed = tempName.trim()
            setEditing(false)
            if (!trimmed) {
                setTempName(committedNameRef.current)
                return
            }
            if (trimmed !== committedNameRef.current) {
                debouncedSave.cancel?.()
                pendingSaveRef.current = trimmed
                committedNameRef.current = trimmed
                updateTask({ type: 'rename', id: task.id, name: trimmed })
            }
        }, [tempName, updateTask, task.id, debouncedSave])

        const cancel = useCallback(() => {
            setEditing(false)
            setTempName(committedNameRef.current)
            debouncedSave.cancel?.()
        }, [debouncedSave])

        const onEditStart = useCallback(() => setEditing(true), [])

        const openDetail = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation()
                setCurrentRow(task.id)
                setOpen('detail')
            },
            [setCurrentRow, setOpen, task.id],
        )

        const handleToggleStatus = useCallback(() => {
            updateTask({ type: 'setStatus', id: task.id, status: !task.status })
        }, [task.id, task.status, updateTask])

        const dragDisabled = disableDrag || editing

        const [expanded, setExpanded] = useState(false)
        const toggleExpanded = useCallback(() => setExpanded((p) => !p), [])
        const hasSubtasks = (task.subTask?.length ?? 0) > 0
        const {data: project} = useProjectDetailAction(projectId)

        return (
            <>
                <TableRow
                    ref={setNodeRef}
                    style={style}
                    className={cn(
                        "transform-gpu select-none transition-colors duration-150",
                        isDragging
                            ? "ring-2 ring-primary/30 bg-secondary/60"
                            : "hover:bg-muted/40",
                        // garis vertikal antar kolom (semua td kecuali terakhir)
                        "[&>td:not(:last-child)]:border-r [&>td:not(:last-child)]:border-foreground/15",
                        // kalau mau garis horizontal row juga:
                        "border-y border-foreground/15"
                    )}
                    aria-grabbed={isDragging || undefined}
                >
                    {/* Col 1: Drag, expand, name+status, open detail */}
                    <TableCell colSpan={2}>
                        <div className="h-full flex items-center gap-1 min-w-0 group/item"
                             onClick={openDetail}
                        >
                            {/* Drag handle – tetap boleh */}
                            <button
                                ref={setActivatorNodeRef}
                                {...(!dragDisabled ? { ...attributes, ...listeners } : {})}
                                style={!dragDisabled ? { touchAction: "none" } : undefined}
                                type="button"
                                aria-label={dragDisabled ? "Drag disabled" : "Drag task"}
                                disabled={dragDisabled}
                                className={cn(
                                    "shrink-0 rounded text-muted-foreground hover:text-foreground hover:bg-transparent",
                                    "transition-colors cursor-grab active:cursor-grabbing",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                    "disabled:opacity-40 disabled:cursor-not-allowed",
                                    !dragDisabled &&
                                    !isDragging &&
                                    "opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:pointer-events-auto",
                                    !dragDisabled &&
                                    "focus:opacity-100 focus:pointer-events-auto",
                                    isDragging && "opacity-100 pointer-events-auto",
                                )}
                            >
                                <GripVertical size={16} />
                            </button>

                            {/* Expand subtasks */}
                            {hasSubtasks && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleExpanded()
                                    }}
                                    className="w-6 h-6 rounded hover:bg-muted shrink-0"
                                    type="button"
                                >
                                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </Button>
                            )}

                            {/* Task name + status */}
                            <div className={cn("flex-1 min-w-0", !hasSubtasks && "ml-7")}>
                                <TaskName
                                    name={tempName}
                                    lengthSubTask={task.subTask?.length ?? 0}
                                    status={Boolean(task.status)}

                                    // ⬇️ EDIT NAMA DI-LOCK PAKAI hasAccess
                                    editing={editing && hasAccess}
                                    tempName={tempName}
                                    onEdit={() => {
                                        if (!hasAccess) return
                                        onEditStart()
                                    }}
                                    onTempNameChange={(next) => {
                                        if (!hasAccess) return
                                        handleNameChange(next)
                                    }}
                                    onCommit={() => {
                                        if (!hasAccess) return
                                        commit()
                                    }}
                                    onCancel={() => {
                                        if (!hasAccess) return
                                        cancel()
                                    }}

                                    // ⬇️ STATUS TETAP BOLEH DITEKAN WALAU hasAccess = false
                                    onToggleStatus={handleToggleStatus}

                                    inputRef={inputRef}
                                />
                            </div>

                            {/* Open detail – semua boleh */}
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className={cn(
                                    "w-7 h-7 rounded-full transition opacity-0 translate-x-2 pointer-events-none",
                                    "group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:pointer-events-auto",
                                    "focus:opacity-100 focus:translate-x-0",
                                )}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={openDetail}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </TableCell>



                    {/* Col 2: Assignees */}
                    <TableCell className="py-2 px-2 align-middle">
                        <AssigneePicker
                            hasAccess={hasAccess}
                            currentMembers={task.assignees}
                            members={project?.members ?? []}
                            onChange={(next) => updateTask({ type: "setAssignees", id: task.id, assignees: next })}
                        />
                    </TableCell>



                    {/* Col 3: Due date */}
                    <TableCell className="text-xs font-semibold">
                        <div className="h-full flex items-center justify-center text-center">
                            {task?.dueDate ? (
                                <p
                                    className={cn(
                                        'text-xs',
                                        isOverdue(task.dueDate) && 'text-red-500'
                                    )}
                                >
                                    {formatDateTime2(task.dueDate)}
                                </p>
                            ) : ''}
                        </div>
                    </TableCell>

                    {/* Col 4: Creator */}
                    <TableCell className="py-2 pl-2 align-middle">
                        {task.creator?.nama && (
                            <Avatar
                                className="h-7 w-7 ring-2 ring-background"
                                title={`Creator ${task.creator.nama}`}
                            >
                                <AvatarImage src="" alt={task.creator.nama} draggable={false} />
                                <AvatarFallback className="text-[10px] font-semibold">
                                    {initials(task.creator.nama)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </TableCell>
                </TableRow>

                {expanded && (
                    <SubTaskRow taskId={task.id} projectId={projectId} subtasks={task.subTask || []} membersTask={task.assignees || []} />
                )}
            </>
        )
    },
// === memo comparator: cek perubahan subtask secara “brute-force”
    (prev, next) => {
        if (prev.disableDrag !== next.disableDrag) return false
        if (prev.projectId !== next.projectId) return false
        if (prev.task.id !== next.task.id) return false
        if (prev.task.name !== next.task.name) return false
        if (prev.task.status !== next.task.status) return false
        if ((prev.task.dueDate ?? '') !== (next.task.dueDate ?? '')) return false

        // Assignees sama?
        const sameAssignees =
            (prev.task.assignees?.length ?? 0) === (next.task.assignees?.length ?? 0) &&
            (prev.task.assignees ?? []).every(
                (a, i) =>
                    a?.nik === next.task.assignees?.[i]?.nik &&
                    a?.nama === next.task.assignees?.[i]?.nama,
            )
        if (!sameAssignees) return false

        if (prev.task.creator?.nama !== next.task.creator?.nama) return false

        // 🚀 Bandingkan snapshot subTask
        const prevSubStr = JSON.stringify(prev.task.subTask ?? [])
        const nextSubStr = JSON.stringify(next.task.subTask ?? [])
        if (prevSubStr !== nextSubStr) return false

        return true
    })

type TaskNameProps = {
    name: string
    lengthSubTask: number
    status?: boolean
    editing: boolean
    tempName: string
    onEdit: () => void
    onTempNameChange: (value: string) => void
    onCommit: () => void
    onCancel: () => void
    onToggleStatus: () => void
    inputRef: React.RefObject<HTMLInputElement | null>
}

const TaskName = memo(function TaskName({
                                            name,
                                            lengthSubTask,
                                            status,
                                            editing,
                                            tempName,
                                            onEdit,
                                            onTempNameChange,
                                            onCommit,
                                            onCancel,
                                            onToggleStatus,
                                            inputRef,
                                        }: TaskNameProps) {
    return (
        <div className="min-h-[1.5rem] max-w-60">
            {!editing ? (
                <div className="w-full inline-flex items-center gap-2">
                    {/* toggle status */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleStatus()
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onToggleStatus()
                            }
                        }}
                        aria-pressed={!!status}
                        aria-label={status ? 'Tandai belum selesai' : 'Tandai selesai'}
                        className={cn(
                            'group flex items-center justify-center p-0.5 transition-colors rounded-full',
                            status
                                ? 'bg-emerald-500 hover:bg-emerald-600 border-2 border-transparent'
                                : 'bg-transparent hover:bg-emerald-500 border-2 border-emerald-600',
                        )}
                    >
                        <Check
                            className={cn(
                                'w-2.5 h-2.5 transition-colors',
                                status
                                    ? 'text-white'
                                    : 'text-emerald-500 group-hover:text-white',
                            )}
                            aria-hidden
                        />
                    </button>

                    {/* nama + badge subtask */}
                    <button
                        type="button"
                        className={`font-semibold flex-1 min-w-0 text-left inline-flex items-center gap-1 px-1 -mx-1 py-0.5 rounded cursor-text ${
                            status ? 'text-muted-foreground/80' : 'text-primary'
                        }`}
                        title={name}
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onEdit()
                            }
                        }}
                        aria-label={`Task: ${name}${status ? ' (selesai)' : ''}`}
                    >
                        <span className="truncate">{name}</span>
                        {lengthSubTask > 0 && (
                            <span
                                className="shrink-0 inline-flex items-center gap-1 rounded bg-muted px-1 py-0.5
                text-xs leading-none text-muted-foreground"
                                aria-label={`Subtask: ${lengthSubTask}`}
                                title={`${lengthSubTask} subtask`}
                            >
                <ListTree size={14} />
                <span>{lengthSubTask}</span>
              </span>
                        )}
                    </button>
                </div>
            ) : (
                <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={tempName}
                    onBlur={onCommit}
                    onChange={(e) => onTempNameChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            onCommit()
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault()
                            onCancel()
                        }
                    }}
                    aria-label="Edit task name"
                    className="w-full bg-secondary rounded text-sm outline-none px-2 py-0.5"
                />
            )}
        </div>
    )
})

TaskRow.displayName = 'TaskRow'
