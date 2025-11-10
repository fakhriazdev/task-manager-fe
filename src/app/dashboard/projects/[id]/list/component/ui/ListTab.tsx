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

/** Rebuild full tasks array after reordering a subset inside one section */
function mergeReorderedSectionTasks(all: Task[], sectionId: string, reordered: Task[]) {
    const others = all.filter((t) => t.section !== sectionId)
    return [...others, ...reordered]
}

/** Return tasks of a section in their current order */
function tasksOfSection(all: Task[], sectionId: string) {
    return all.filter((t) => t.section === sectionId)
}

/* =========================
   Component
   ========================= */
export default function ListTab() {
    // --- project id
    const { id } = useParams();
    const projectId = useMemo(() => (Array.isArray(id) ? id[0] : id) ?? "", [id]);

    // --- API hooks
    const { data: taskList, isLoading, error } = useProjectTasksAction(projectId)
    const moveSectionMutation = useMoveSection(projectId ?? '')
    const moveTaskMutation = useMoveTask(projectId ?? '')

    // --- DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    )

    // --- local state
    const [sections, setSections] = useState<Section[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'task' | 'section' | null>(null)

    // Scroll container for drift-compensation
    const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)

    // Snapshot for rollback when drop invalid
    const dragSnapshotRef = useRef<{ tasks: Task[] | null; sections: Section[] | null }>({
        tasks: null,
        sections: null,
    })

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

    const resetDnD = useCallback(() => {
        setActiveId(null)
        setActiveType(null)
        dragSnapshotRef.current = { tasks: null, sections: null }
    }, [])

    /* =========================
       DnD handlers
       ========================= */
    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const idStr = String(event.active.id)
            if (idStr.startsWith('section-')) {
                setActiveType('section')
                setActiveId(getSectionIdFromDom(idStr))
                dragSnapshotRef.current.sections = sections
                dragSnapshotRef.current.tasks = null
            } else {
                setActiveType('task')
                setActiveId(idStr)
                dragSnapshotRef.current.tasks = tasks
                dragSnapshotRef.current.sections = null
            }
        },
        [sections, tasks],
    )

    // Live preview reorder while dragging a task
    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            if (activeType !== 'task') return

            const { active, over } = event
            if (!over) return

            const activeIdStr = String(active.id)
            const overIdStr = String(over.id)

            // Skip when hovering container header itself (no specific target item)
            if (isDroppableContainer(overIdStr)) return

            setTasks((current) => {
                const activeTask = current.find((t) => t.id === activeIdStr)
                const overTask = current.find((t) => t.id === overIdStr)
                if (!activeTask || !overTask) return current

                // Move across sections (preview)
                if (activeTask.section !== overTask.section) {
                    return current.map((t) =>
                        t.id === activeIdStr ? { ...t, section: overTask.section } : t,
                    )
                }

                // Reorder inside same section
                const sectionId = activeTask.section
                const same = tasksOfSection(current, sectionId)
                const from = same.findIndex((t) => t.id === activeIdStr)
                const to = same.findIndex((t) => t.id === overIdStr)
                if (from < 0 || to < 0 || from === to) return current

                const reordered = arrayMove(same, from, to)
                return mergeReorderedSectionTasks(current, sectionId, reordered)
            })
        },
        [activeType],
    )

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event

            // Drop di area tidak valid: rollback
            if (!over) {
                if (activeType === 'task' && dragSnapshotRef.current.tasks) {
                    setTasks(dragSnapshotRef.current.tasks)
                } else if (activeType === 'section' && dragSnapshotRef.current.sections) {
                    setSections(dragSnapshotRef.current.sections)
                }
                resetDnD()
                return
            }

            const activeIdStr = String(active.id)
            const overIdStr = String(over.id)

            /* ----- Move SECTION ----- */
            if (activeType === 'section') {
                const movedId = getSectionIdFromDom(activeIdStr)

                // Tentukan “over section” baik ketika drop di header section atau di container task-nya
                let overSectionDomId: string | null = null
                if (overIdStr.startsWith('section-')) {
                    overSectionDomId = overIdStr
                } else {
                    const data = over.data?.current
                    if (isTaskContainerData(data)) {
                        overSectionDomId = sectionDomId(data.sectionId)
                    }
                }

                if (!overSectionDomId) {
                    resetDnD()
                    return
                }

                const overSectionId = getSectionIdFromDom(overSectionDomId)
                if (movedId === overSectionId) {
                    resetDnD()
                    return
                }

                setSections((prev) => {
                    const domIds = prev.map((s) => sectionDomId(s.id))
                    const fromIndex = domIds.indexOf(sectionDomId(movedId))
                    const toIndex = domIds.indexOf(sectionDomId(overSectionId))
                    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev

                    const newDomOrder = arrayMove(domIds, fromIndex, toIndex)
                    const newIndex = newDomOrder.indexOf(sectionDomId(movedId))
                    const leftDom = newDomOrder[newIndex - 1] ?? null
                    const rightDom = newDomOrder[newIndex + 1] ?? null
                    const afterId = leftDom ? getSectionIdFromDom(leftDom) : null
                    const beforeId = rightDom ? getSectionIdFromDom(rightDom) : null

                    if (projectId) {
                        moveSectionMutation.mutate({ sectionId: movedId, payload: { beforeId, afterId } })
                    }

                    return arrayMove(prev, fromIndex, toIndex)
                })

                resetDnD()
                return
            }

            /* ----- Move TASK ----- */
            if (activeType === 'task') {
                const movedTaskId = activeIdStr

                setTasks((current) => {
                    // Tentukan destinasi section (drop di container vs drop di atas task lain)
                    let destSectionId: string
                    if (isDroppableContainer(overIdStr)) {
                        destSectionId = getSectionIdFromDroppable(overIdStr)
                    } else {
                        const overTask = current.find((t) => t.id === overIdStr)
                        if (!overTask) return dragSnapshotRef.current.tasks ?? current
                        destSectionId = overTask.section
                    }

                    const movedTask = current.find((t) => t.id === movedTaskId)
                    if (!movedTask) return current

                    // Hitung tetangga untuk payload (sederhana: pasang setelah item terakhir di destinasi)
                    const inDest = tasksOfSection(current, destSectionId).map((t) => t.id)
                    const afterId = inDest.length > 0 ? inDest[inDest.length - 1] : null
                    const beforeId = null

                    if (projectId) {
                        moveTaskMutation.mutate({
                            taskId: movedTaskId,
                            payload: {
                                targetSectionId: destSectionId === UNLOCATED_ID ? null : destSectionId,
                                afterId,
                                beforeId,
                            },
                        })
                    }

                    // Update lokal: pindahkan task ke destinasi (posisi akhir list)
                    const next = current
                        .map((t) => (t.id === movedTaskId ? { ...t, section: destSectionId } : t))

                    return next
                })

                resetDnD()
                return
            }
        },
        [activeType, moveSectionMutation, moveTaskMutation, projectId, resetDnD],
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
        <main className="min-h-screen bg-background text-foreground">
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
                        autoScroll={false}
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
                                <SectionGhost title={activeSection.name} count={(grouped[activeSection.id]?.length ?? 0)} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            />
            <ProjectDialogs projectId={projectId} />
        </main>
    )
}
