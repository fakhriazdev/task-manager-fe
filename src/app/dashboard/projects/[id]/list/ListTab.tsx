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
import {TaskTableView} from '@/app/dashboard/projects/[id]/list/component/TaskTableView'
import {SectionGhost, TaskGhost} from './component/TableRowOverlay'
import type {Section, Task} from './types/task'
import {adjustForScroll} from "@/utils/adjustForScroll";
import ProjectDialogs from "@/app/dashboard/projects/[id]/list/component/ProjectDialogs";

// === util DnD ===
const UNLOCATED_ID = 'unlocated'
const sectionDomId = (id: string) => `section-${id}`
const getSectionIdFromDom = (domId: string) => domId.replace(/^section-/, '')
const isDroppable = (id: string) => id.startsWith('droppable-section-')
const getSectionIdFromDroppable = (id: string) => id.replace(/^droppable-section-/, '')

type DndTaskContainerData = { type: 'task-container'; sectionId: string }
function isTaskContainerData(x: unknown): x is DndTaskContainerData {
    return typeof x === 'object' && x !== null &&
        (x as {type?: unknown}).type === 'task-container' &&
        typeof (x as {sectionId?: unknown}).sectionId === 'string'
}

export default function ListTab() {
    const {id} = useParams()
    const projectId = Array.isArray(id) ? id[0] : id

    const {data: taskList, isLoading, error} = useProjectTasksAction(projectId)
    const moveSectionMutation = useMoveSection(projectId ?? '')
    const moveTaskMutation = useMoveTask(projectId ?? '')

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 6}})
    )

    const [sections, setSections] = useState<Section[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'task' | 'section' | null>(null)

    // viewport ScrollArea untuk kompensasi drift
    const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)

    const dragStateRef = useRef<{
        originalTasks: Task[] | null
        originalSections: Section[] | null
    }>({originalTasks: null, originalSections: null})

    useEffect(() => {
        if (!taskList) return

        const apiSections: Section[] = taskList.sections.map((s) => ({id: s.id, name: s.name}))
        const apiTasks: Task[] = []

        if (taskList.unlocated?.length) {
            apiTasks.push(
                ...taskList.unlocated.map((t) => ({
                    id: t.id,
                    name: t.name,
                    desc: t.desc,
                    dueDate: t.dueDate,
                    section: UNLOCATED_ID,
                    creator: t.creator,
                    status: t.status,
                    assignees: t.assignees,
                }))
            )
        }

        taskList.sections.forEach((s) => {
            if (s.tasks?.length) {
                apiTasks.push(
                    ...s.tasks.map((t) => ({
                        id: t.id,
                        name: t.name,
                        section: s.id,
                        desc: t.desc,
                        dueDate: t.dueDate,
                        creator: t.creator,
                        status: t.status,
                        assignees: t.assignees,
                    }))
                )
            }
        })

        setSections(apiSections)
        setTasks(apiTasks)
    }, [taskList])

    const resetDnD = useCallback(() => {
        setActiveId(null)
        setActiveType(null)
        dragStateRef.current = {originalTasks: null, originalSections: null}
    }, [])

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const {active} = event
        const idStr = String(active.id)
        if (idStr.startsWith('section-')) {
            setActiveType('section')
            setActiveId(getSectionIdFromDom(idStr))
            dragStateRef.current.originalSections = sections
            dragStateRef.current.originalTasks = null
        } else {
            setActiveType('task')
            setActiveId(idStr)
            dragStateRef.current.originalTasks = tasks
            dragStateRef.current.originalSections = null
        }
    }, [sections, tasks])

    // Live preview reorder saat drag task
    const handleDragOver = useCallback((event: DragOverEvent) => {
        const {active, over} = event
        if (!over || activeType !== 'task') return

        const activeIdStr = String(active.id)
        const overIdStr = String(over.id)

        if (isDroppable(overIdStr)) return // jangan ubah saat hover container

        setTasks((current) => {
            const activeTask = current.find((t) => t.id === activeIdStr)
            const overTask = current.find((t) => t.id === overIdStr)
            if (!activeTask || !overTask) return current

            if (activeTask.section !== overTask.section) {
                return current.map((t) => t.id === activeIdStr ? {...t, section: overTask.section} : t)
            } else {
                const same = current.filter((t) => t.section === activeTask.section)
                const oldIndex = same.findIndex((t) => t.id === activeIdStr)
                const newIndex = same.findIndex((t) => t.id === overIdStr)
                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return current

                const reordered = arrayMove(same, oldIndex, newIndex)
                const others = current.filter((t) => t.section !== activeTask.section)
                return [...others, ...reordered]
            }
        })
    }, [activeType])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const {active, over} = event
        if (!over) {
            if (activeType === 'task' && dragStateRef.current.originalTasks) {
                setTasks(dragStateRef.current.originalTasks)
            } else if (activeType === 'section' && dragStateRef.current.originalSections) {
                setSections(dragStateRef.current.originalSections)
            }
            resetDnD()
            return
        }

        const activeIdStr = String(active.id)
        const overIdStr = String(over.id)

        // === SECTION dipindahkan
        if (activeType === 'section') {
            const movedId = getSectionIdFromDom(activeIdStr)

            let overSectionDomId: string | null = null
            if (String(over.id).startsWith('section-')) {
                overSectionDomId = String(over.id)
            } else {
                const data = over.data?.current as unknown
                if (isTaskContainerData(data)) {
                    overSectionDomId = sectionDomId(data.sectionId)
                }
            }

            if (!overSectionDomId) { resetDnD(); return }

            const overId = getSectionIdFromDom(overSectionDomId)
            if (movedId === overId) { resetDnD(); return }

            setSections((prev) => {
                const domIds = prev.map((s) => sectionDomId(s.id))
                const fromIndex = domIds.indexOf(sectionDomId(movedId))
                const toIndex = domIds.indexOf(sectionDomId(overId))
                if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev

                const newOrderDom = arrayMove(domIds, fromIndex, toIndex)
                const newIndex = newOrderDom.indexOf(sectionDomId(movedId))
                const leftDom = newOrderDom[newIndex - 1] ?? null
                const rightDom = newOrderDom[newIndex + 1] ?? null
                const afterId = leftDom ? getSectionIdFromDom(leftDom) : null
                const beforeId = rightDom ? getSectionIdFromDom(rightDom) : null

                if (projectId) {
                    moveSectionMutation.mutate({
                        sectionId: movedId,
                        payload: {beforeId, afterId},
                    })
                }
                return arrayMove(prev, fromIndex, toIndex)
            })

            resetDnD()
            return
        }

        // === TASK dipindahkan
        if (activeType === 'task') {
            const movedTaskId = activeIdStr

            setTasks((current) => {
                let destSectionId: string
                if (isDroppable(overIdStr)) {
                    destSectionId = getSectionIdFromDroppable(overIdStr)
                } else {
                    const overTask = current.find((t) => t.id === overIdStr)
                    if (!overTask) return dragStateRef.current.originalTasks ?? current
                    destSectionId = overTask.section
                }

                const movedTask = current.find((t) => t.id === movedTaskId)
                if (!movedTask) return current

                const inDest = current.filter((t) => t.section === destSectionId).map((t) => t.id)
                const leftId = inDest.length > 0 ? inDest[inDest.length - 1] : null
                const rightId = null

                if (projectId) {
                    moveTaskMutation.mutate({
                        taskId: movedTaskId,
                        payload: {
                            targetSectionId: destSectionId === UNLOCATED_ID ? null : destSectionId,
                            afterId: leftId,
                            beforeId: rightId,
                        },
                    })
                }

                return current.map((t) => t.id === movedTaskId ? {...t, section: destSectionId} : t)
            })

            resetDnD()
            return
        }
    }, [activeType, projectId, moveSectionMutation, moveTaskMutation, resetDnD])

    // === data untuk overlay ===
    const activeTask = useMemo(
        () => (activeType === 'task' ? tasks.find((t) => t.id === activeId) ?? null : null),
        [activeType, activeId, tasks]
    )
    const activeSection = useMemo(
        () => (activeType === 'section' ? sections.find((s) => s.id === activeId) ?? null : null),
        [activeType, activeId, sections]
    )

    const grouped = useMemo<Record<string, Task[]>>(() =>
        sections.reduce<Record<string, Task[]>>((acc, s) => {
            acc[s.id] = tasks.filter((t) => t.section === s.id)
            return acc
        }, {}), [sections, tasks])

    const unlocatedTasks = useMemo(
        () => tasks.filter((t) => t.section === UNLOCATED_ID),
        [tasks]
    )

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading tasks...</div>
    if (error) return <div className="p-4 text-sm text-red-500">Failed to load tasks</div>

    const isDraggingTask = activeType === 'task'

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
                        measuring={{droppable: {strategy: MeasuringStrategy.Always}}}
                        autoScroll={false} // penting agar overlay tidak drift
                        modifiers={[adjustForScroll(() => viewportEl)]}
                    >
                        <SortableContext
                            items={sections.map((s) => `section-${s.id}`)}
                            strategy={verticalListSortingStrategy}
                        >
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
            <ProjectDialogs projectId={projectId}/>
        </main>
    )
}
