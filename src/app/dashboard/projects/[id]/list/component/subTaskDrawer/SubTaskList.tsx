'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
    DndContext,
    DragEndEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import SortableSubtaskRow from '@/app/dashboard/projects/[id]/list/component/subTaskDrawer/SortableSubTaskRow'
import type { SubTask } from '@/lib/project/projectTypes'
import {
    useAddSubTask,
    useDeleteSubTask,
    useMoveSubTask,
    useUpdateSubTask,
    useLiveTask,
} from '@/lib/project/projectAction'

function equalSubtasks(a: SubTask[], b: SubTask[]) {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
        const x = a[i], y = b[i]
        if (
            x.id !== y.id ||
            x.name !== y.name ||
            !!x.status !== !!y.status ||
            (x.dueDate ?? null) !== (y.dueDate ?? null) ||
            (x.rank ?? null) !== (y.rank ?? null)
        )
            return false
    }
    return true
}

type Props = {
    projectId: string
    taskId: string
}

export default function SubtaskList({ projectId, taskId }: Props) {
    // 1) Live data dari cache
    const liveTask = useLiveTask(projectId, taskId)
    const liveItems = useMemo<SubTask[]>(
        () => (Array.isArray(liveTask?.subTask) ? liveTask!.subTask : []),
        [liveTask],
    )

    // 2) State lokal daftar subtasks
    const [items, setItems] = useState<SubTask[]>(liveItems)
    const isDraggingRef = useRef(false)

    // 3) Sinkronkan dari liveItems → items HANYA jika:
    //    - tidak sedang drag
    //    - tidak ada baris _isNew/tmp_ (agar baris baru tidak langsung “hilang”)
    //    - dan memang berbeda
    useEffect(() => {
        if (isDraggingRef.current) return

        const hasTemp = items.some(
            (it) => it._isNew || String(it.id).startsWith('tmp_'),
        )
        if (hasTemp) return

        if (!equalSubtasks(items, liveItems)) {
            setItems(liveItems)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveItems]) // sengaja tidak memasukkan `items` supaya tidak loop saat setItems

    // 4) Hooks mutasi
    const addSubtask = useAddSubTask(projectId, taskId)
    const updateSubtask = useUpdateSubTask(projectId)
    const deleteSubtask = useDeleteSubTask(projectId)
    const moveSubtask = useMoveSubTask(projectId)

    // 5) DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    )

    const ids = useMemo(() => items.map((i) => i.id), [items])

    // 6) Drag handlers
    const onDragStart = useCallback(() => {
        isDraggingRef.current = true
    }, [])

    const onDragEnd = useCallback(
        async (e: DragEndEvent) => {
            const { active, over } = e
            const prev = items

            try {
                if (!over || active.id === over.id) return

                const oldIdx = prev.findIndex((i) => i.id === active.id)
                const newIdx = prev.findIndex((i) => i.id === over.id)
                if (oldIdx === -1 || newIdx === -1) return

                // optimistic UI
                const next = arrayMove(prev, oldIdx, newIdx)
                setItems(next)

                // jika item masih tmp, jangan call API reorder
                if (String(active.id).startsWith('tmp_')) return

                // tetangga di urutan baru
                const beforeId = newIdx > 0 ? next[newIdx - 1]?.id ?? null : null
                const afterId = newIdx < next.length - 1 ? next[newIdx + 1]?.id ?? null : null

                await moveSubtask.mutateAsync({
                    taskId,
                    subtaskId: String(active.id),
                    payload: { beforeId, afterId },
                })
                // invalidate dari hook akan sync kembali `liveItems`
            } catch (err) {
                console.error('Move subtask failed:', err)
                setItems(prev)
            } finally {
                isDraggingRef.current = false
            }
        },
        [items, moveSubtask, taskId],
    )

    // 7) Tambah baris kosong (optimistic, _isNew)
    const addEmpty = useCallback(() => {
        setItems((prev) => [
            ...prev,
            {
                id: `tmp_${Date.now()}`,
                name: '',
                status: false,
                dueDate: null,
                _isNew: true,
            } as SubTask,
        ])
    }, [])

    // 8) Handlers untuk row anak
    const handlers = useMemo(
        () => ({ addSubtask, updateSubtask, deleteSubtask, setItems }),
        [addSubtask, updateSubtask, deleteSubtask, setItems],
    )

    return (
        <div className="space-y-1" role="region" aria-label="Daftar subtugas">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0" role="list">
                        {items.map((it) => (
                            <SortableSubtaskRow
                                key={it.id}
                                item={it}
                                taskId={taskId}
                                handlers={handlers}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {items.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                    Belum ada subtugas. Klik tombol di bawah untuk menambahkan.
                </div>
            )}

            <div className="pt-2">
                <Button type="button" variant="ghost" onClick={addEmpty} className="justify-start">
                    <Plus className="size-4" />
                    Tambah subtugas
                </Button>
            </div>
        </div>
    )
}
