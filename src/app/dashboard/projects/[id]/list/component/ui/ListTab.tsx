'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MeasuringStrategy,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {arrayMove, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {useParams} from 'next/navigation'
import {useMoveSection, useMoveTask, useProjectTasksAction} from '@/lib/project/projectAction'
import {TaskTableView} from '@/app/dashboard/projects/[id]/list/component/ui/TaskTableView'
import {SectionGhost, TaskGhost} from '@/app/dashboard/projects/[id]/list/component/ui/rows/RowGhost'
import type {Section} from '../../types/task'
import type {Task} from '@/lib/project/projectTypes'
import {adjustForScroll} from '@/utils/adjustForScroll'
import ProjectDialogs from '@/app/dashboard/projects/[id]/list/component/dialogs/ProjectDialogs'

/* =========================
   Constants & Helpers
   ========================= */
const UNLOCATED_ID = 'unlocated' as const

const sectionDomId = (id: string) => `section-${id}`
const getSectionIdFromDom = (domId: string) => domId.replace(/^section-/, '')
const isDroppableContainer = (id: string) => id.startsWith('droppable-section-')
const getSectionIdFromDroppable = (id: string) => id.replace(/^droppable-section-/, '')

type DndTaskContainerData = { type: 'task-container'; sectionId: string }
const isTaskContainerData = (x: unknown): x is DndTaskContainerData =>
    !!x &&
    typeof x === 'object' &&
    (x as { type?: unknown }).type === 'task-container' &&
    typeof (x as { sectionId?: unknown }).sectionId === 'string'

/** Return tasks of a section in their current order */
function tasksOfSection(all: Task[], sectionId: string) {
    return all.filter((t) => t.section === sectionId)
}

/* =========================
   Component
   ========================= */
export default function ListTab() {
    const { id } = useParams();
    const projectId = useMemo(() => (Array.isArray(id) ? id[0] : id) ?? "", [id]);

    const { data: taskList, isLoading, error } = useProjectTasksAction(projectId)
    const moveSectionMutation = useMoveSection(projectId ?? '')
    const moveTaskMutation = useMoveTask(projectId ?? '')

    // 🎯 SAMA SEPERTI SUBTASK: activation distance kecil untuk responsiveness
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // Lebih kecil = lebih responsive
            }
        }),
    )

    const [sections, setSections] = useState<Section[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'task' | 'section' | null>(null)

    const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)

    // 🎯 Snapshot untuk rollback - SIMPLIFIED
    const snapshotRef = useRef<{
        tasks: Task[]
        sections: Section[]
    }>({ tasks: [], sections: [] })

    /* =========================
       Hydrate from API
       ========================= */
    useEffect(() => {
        if (!taskList) return

        const apiSections: Section[] = taskList.sections.map((s) => ({ id: s.id, name: s.name }))

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

    /* =========================
       DnD handlers - SIMPLIFIED LIKE SUBTASK
       ========================= */
    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const idStr = String(event.active.id)

            if (idStr.startsWith('section-')) {
                setActiveType('section')
                setActiveId(getSectionIdFromDom(idStr))
                snapshotRef.current = { tasks, sections }
            } else {
                setActiveType('task')
                setActiveId(idStr)
                snapshotRef.current = { tasks, sections }
            }
        },
        [sections, tasks],
    )

    // 🎯 SIMPLIFIED: Langsung arrayMove tanpa logic kompleks
    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            if (activeType !== 'task') return

            const { active, over } = event
            if (!over) return

            const activeIdStr = String(active.id)
            const overIdStr = String(over.id)

            setTasks((current) => {
                const activeTask = current.find((t) => t.id === activeIdStr)
                if (!activeTask) return current

                // 🟢 CASE 1: Drop di container section (bagian kosong)
                if (isDroppableContainer(overIdStr)) {
                    const targetSectionId = getSectionIdFromDroppable(overIdStr)

                    // Kalau sudah di section itu, nggak perlu apa-apa
                    if (activeTask.section === targetSectionId) return current

                    // Pindahkan task ke section kosong (atau container section)
                    return current.map((t) =>
                        t.id === activeIdStr ? { ...t, section: targetSectionId } : t,
                    )
                }

                // 🟢 CASE 2: Drop di task lain (section yang sudah punya task)
                const overTask = current.find((t) => t.id === overIdStr)
                if (!overTask) return current

                // Cross-section move (dari section A ke section B yang ada task-nya)
                if (activeTask.section !== overTask.section) {
                    // Pindahkan dulu ke section target (B)
                    const updated = current.map((t) =>
                        t.id === activeIdStr ? { ...t, section: overTask.section } : t,
                    )

                    // Opsional: kalau mau langsung urutin juga bisa dibuat lebih kompleks,
                    // tapi untuk sekarang cukup pindah section, urutan diatur saat drag berikutnya.
                    return updated
                }

                // 🟢 CASE 3: Reorder di section yang sama
                const sectionTasks = tasksOfSection(current, activeTask.section)
                const activeIndex = sectionTasks.findIndex((t) => t.id === activeIdStr)
                const overIndex = sectionTasks.findIndex((t) => t.id === overIdStr)

                if (activeIndex === -1 || overIndex === -1) return current

                const reordered = arrayMove(sectionTasks, activeIndex, overIndex)

                // Merge back ke list global
                const otherTasks = current.filter((t) => t.section !== activeTask.section)
                return [...otherTasks, ...reordered]
            })
        },
        [activeType],
    )


    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event

            // No valid drop target: rollback
            if (!over) {
                console.warn('⚠️ Invalid drop, rolling back')
                setTasks(snapshotRef.current.tasks)
                setSections(snapshotRef.current.sections)
                setActiveId(null)
                setActiveType(null)
                return
            }

            const activeIdStr = String(active.id)
            const overIdStr = String(over.id)

            /* ----- Move SECTION ----- */
            if (activeType === 'section') {
                const movedId = getSectionIdFromDom(activeIdStr)
                let overSectionDomId: string | null = null

                if (overIdStr.startsWith('section-')) {
                    overSectionDomId = overIdStr
                } else {
                    const data = over.data?.current
                    if (isTaskContainerData(data)) {
                        overSectionDomId = sectionDomId(data.sectionId)
                    }
                }

                if (!overSectionDomId || movedId === getSectionIdFromDom(overSectionDomId)) {
                    setActiveId(null)
                    setActiveType(null)
                    return
                }

                const overSectionId = getSectionIdFromDom(overSectionDomId)

                setSections((prev) => {
                    const domIds = prev.map((s) => sectionDomId(s.id))
                    const fromIndex = domIds.indexOf(sectionDomId(movedId))
                    const toIndex = domIds.indexOf(sectionDomId(overSectionId))

                    if (fromIndex < 0 || toIndex < 0) return prev

                    const newOrder = arrayMove(prev, fromIndex, toIndex)
                    const newIndex = newOrder.findIndex((s) => s.id === movedId)

                    const afterId = newOrder[newIndex - 1]?.id ?? null
                    const beforeId = newOrder[newIndex + 1]?.id ?? null

                    if (projectId) {
                        moveSectionMutation.mutate({
                            sectionId: movedId,
                            payload: { beforeId, afterId }
                        })
                    }

                    return newOrder
                })

                setActiveId(null)
                setActiveType(null)
                return
            }

            /* ----- Move TASK - FIXED CALCULATION ----- */
            if (activeType === 'task') {
                const movedTaskId = activeIdStr

                setTasks((current) => {
                    const movedTask = current.find((t) => t.id === movedTaskId)
                    if (!movedTask) return current

                    // Determine target section
                    let targetSectionId: string

                    if (isDroppableContainer(overIdStr)) {
                        targetSectionId = getSectionIdFromDroppable(overIdStr)
                    } else {
                        const overTask = current.find((t) => t.id === overIdStr)
                        if (!overTask) return current
                        targetSectionId = overTask.section
                    }

                    // 🔥 FIX: Get tasks AFTER reordering (current state sudah correct dari onDragOver)
                    const sectionTasks = tasksOfSection(current, targetSectionId)
                    const movedIndex = sectionTasks.findIndex((t) => t.id === movedTaskId)

                    if (movedIndex === -1) {
                        console.error('Task not found in section after reorder')
                        return current
                    }

                    // 🎯 Calculate neighbors: task SEBELUM (afterId) dan SESUDAH (beforeId)
                    // Backend logic: afterId = task di ATAS, beforeId = task di BAWAH
                    let afterId: string | null = null   // task di atas
                    let beforeId: string | null = null  // task di bawah

                    if (movedIndex === 0) {
                        // Task ada di paling atas
                        afterId = null
                        beforeId = sectionTasks[1]?.id ?? null
                    } else if (movedIndex === sectionTasks.length - 1) {
                        // Task ada di paling bawah
                        afterId = sectionTasks[movedIndex - 1]?.id ?? null
                        beforeId = null
                    } else {
                        // Task ada di tengah
                        afterId = sectionTasks[movedIndex - 1]?.id ?? null
                        beforeId = sectionTasks[movedIndex + 1]?.id ?? null
                    }

                    console.log('📤 Moving task:', {
                        taskId: movedTaskId,
                        section: targetSectionId,
                        position: movedIndex,
                        totalInSection: sectionTasks.length,
                        afterId: afterId || 'null (paling atas)',
                        beforeId: beforeId || 'null (paling bawah)',
                    })

                    if (projectId) {
                        moveTaskMutation.mutate({
                            taskId: movedTaskId,
                            payload: {
                                targetSectionId: targetSectionId === UNLOCATED_ID ? null : targetSectionId,
                                afterId,
                                beforeId,
                            },
                        })
                    }

                    return current
                })

                setActiveId(null)
                setActiveType(null)
                return
            }

            setActiveId(null)
            setActiveType(null)
        },
        [activeType, moveSectionMutation, moveTaskMutation, projectId],
    )

    /* =========================
       Derived values
       ========================= */
    const activeTask = useMemo(
        () => (activeType === 'task' ? tasks.find((t) => t.id === activeId) ?? null : null),
        [activeType, activeId, tasks],
    )

    const activeSection = useMemo(
        () => (activeType === 'section' ? sections.find((s) => s.id === activeId) ?? null : null),
        [activeType, activeId, sections],
    )

    const grouped = useMemo(
        () =>
            sections.reduce<Record<string, Task[]>>((acc, s) => {
                acc[s.id] = tasksOfSection(tasks, s.id)
                return acc
            }, {}),
        [sections, tasks],
    )

    const unlocatedTasks = useMemo(
        () => tasks.filter((t) => t.section === UNLOCATED_ID),
        [tasks],
    )

    const sortableItems = useMemo(
        () => sections.map((s) => sectionDomId(s.id)),
        [sections],
    )

    const isDraggingTask = activeType === 'task'

    /* =========================
       UI states
       ========================= */
    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading tasks...</div>
    if (error) return <div className="p-4 text-sm text-red-500">Failed to load tasks</div>

    /* =========================
       Render
       ========================= */
    return (
        <main className="min-h-screen bg-background text-foreground pb-5">
            <TaskTableView
                sections={sections}
                grouped={grouped}
                projectId={projectId}
                unlocatedTasks={unlocatedTasks}
                disableDropForSections={activeType === 'section'}
                isDraggingTask={isDraggingTask}
                onViewportReady={setViewportEl}
                renderDnD={(children) => (
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
                            {children}
                        </SortableContext>

                        <DragOverlay dropAnimation={null}>
                            {activeType === 'task' && activeTask ? (
                                <TaskGhost
                                    name={activeTask.name}
                                    assignees={Array.isArray(activeTask.assignees) ? activeTask.assignees : []}
                                    creator={activeTask.creator}
                                />
                            ) : activeType === 'section' && activeSection ? (
                                <SectionGhost
                                    title={activeSection.name}
                                    count={(grouped[activeSection.id]?.length ?? 0)}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            />
            <ProjectDialogs projectId={projectId} />
        </main>
    )
}