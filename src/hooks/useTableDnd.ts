'use client'

import {
    useCallback,
    useEffect,
    useMemo,
    useRef, useState,
} from 'react'
import {
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Task } from '@/lib/project/projectTypes'
import { SectionVM } from '@/app/dashboard/projects/[id]/list/component/ui/section/SectionTBody'

/* =========================
   Helpers & types internal
   ========================= */

type DndTaskContainerData = { type: 'task-container'; sectionId: string }

const RADIX_VP_SELECTOR = '[data-radix-scroll-area-viewport]'

const sectionDomId = (id: string) => `section-${id}`
const getSectionIdFromDom = (domId: string) => domId.replace(/^section-/, '')
const isDroppableContainer = (id: string) => id.startsWith('droppable-section-')
const getSectionIdFromDroppable = (id: string) => id.replace(/^droppable-section-/, '')

const isTaskContainerData = (x: unknown): x is DndTaskContainerData =>
    !!x &&
    typeof x === 'object' &&
    (x as { type?: unknown }).type === 'task-container' &&
    typeof (x as { sectionId?: unknown }).sectionId === 'string'

function tasksOfSection(all: Task[], sectionId: string) {
    return all.filter((t) => t.section === sectionId)
}

/* =========================
   Hook API
   ========================= */

type MoveSectionArgs = {
    sectionId: string
    beforeId: string | null
    afterId: string | null
}

type MoveTaskArgs = {
    taskId: string
    targetSectionId: string | null
    beforeId: string | null
    afterId: string | null
}

type UseTaskTableDndParams = {
    tasks: Task[]
    sections: SectionVM[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    setSections: React.Dispatch<React.SetStateAction<SectionVM[]>>
    unlocatedId: string
    moveSection: (args: MoveSectionArgs) => void
    moveTask: (args: MoveTaskArgs) => void
}

export function useTaskTableDnd({
                                    tasks,
                                    sections,
                                    setTasks,
                                    setSections,
                                    unlocatedId,
                                    moveSection,
                                    moveTask,
                                }: UseTaskTableDndParams) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 3 },
        }),
    )

    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'task' | 'section' | null>(null)
    const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)
    const rootRef = useRef<HTMLDivElement | null>(null)

    // snapshot untuk rollback
    const snapshotRef = useRef<{
        tasks: Task[]
        sections: SectionVM[]
    }>({ tasks: [], sections: [] })

    // detect viewport Radix untuk auto-scroll
    useEffect(() => {
        const vp = rootRef.current?.querySelector(
            RADIX_VP_SELECTOR,
        ) as HTMLElement | null
        setViewportEl(vp ?? null)
    }, [])

    /* =========================
       Handlers
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
        [tasks, sections],
    )

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

                // CASE 1: Drop di container section (area kosong)
                if (isDroppableContainer(overIdStr)) {
                    const targetSectionId = getSectionIdFromDroppable(overIdStr)

                    if (activeTask.section === targetSectionId) return current

                    return current.map((t) =>
                        t.id === activeIdStr ? { ...t, section: targetSectionId } : t,
                    )
                }

                // CASE 2: Drop di task lain
                const overTask = current.find((t) => t.id === overIdStr)
                if (!overTask) return current

                if (activeTask.section !== overTask.section) {
                    // pindah section
                    const updated = current.map((t) =>
                        t.id === activeIdStr ? { ...t, section: overTask.section } : t,
                    )
                    return updated
                }

                // CASE 3: Reorder dalam section yang sama
                const sectionTasks = tasksOfSection(current, activeTask.section)
                const activeIndex = sectionTasks.findIndex((t) => t.id === activeIdStr)
                const overIndex = sectionTasks.findIndex((t) => t.id === overIdStr)
                if (activeIndex === -1 || overIndex === -1) return current

                const reordered = arrayMove(sectionTasks, activeIndex, overIndex)
                const otherTasks = current.filter((t) => t.section !== activeTask.section)
                return [...otherTasks, ...reordered]
            })
        },
        [activeType, setTasks],
    )

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event

            if (!over) {
                // rollback
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

                    moveSection({
                        sectionId: movedId,
                        beforeId,
                        afterId,
                    })

                    return newOrder
                })

                setActiveId(null)
                setActiveType(null)
                return
            }

            /* ----- Move TASK ----- */
            if (activeType === 'task') {
                const movedTaskId = activeIdStr

                setTasks((current) => {
                    const movedTask = current.find((t) => t.id === movedTaskId)
                    if (!movedTask) return current

                    let targetSectionId: string

                    if (isDroppableContainer(overIdStr)) {
                        targetSectionId = getSectionIdFromDroppable(overIdStr)
                    } else {
                        const overTask = current.find((t) => t.id === overIdStr)
                        if (!overTask) return current
                        targetSectionId = overTask.section
                    }

                    const sectionTasks = tasksOfSection(current, targetSectionId)
                    const movedIndex = sectionTasks.findIndex((t) => t.id === movedTaskId)
                    if (movedIndex === -1) return current

                    let afterId: string | null = null
                    let beforeId: string | null = null

                    if (movedIndex === 0) {
                        afterId = null
                        beforeId = sectionTasks[1]?.id ?? null
                    } else if (movedIndex === sectionTasks.length - 1) {
                        afterId = sectionTasks[movedIndex - 1]?.id ?? null
                        beforeId = null
                    } else {
                        afterId = sectionTasks[movedIndex - 1]?.id ?? null
                        beforeId = sectionTasks[movedIndex + 1]?.id ?? null
                    }

                    moveTask({
                        taskId: movedTaskId,
                        targetSectionId: targetSectionId === unlocatedId ? null : targetSectionId,
                        afterId,
                        beforeId,
                    })

                    return current
                })

                setActiveId(null)
                setActiveType(null)
                return
            }

            setActiveId(null)
            setActiveType(null)
        },
        [activeType, moveSection, moveTask, setTasks, setSections, unlocatedId],
    )

    /* =========================
       Derived values
       ========================= */

    const activeTask = useMemo(
        () =>
            activeType === 'task'
                ? tasks.find((t) => t.id === activeId) ?? null
                : null,
        [activeType, activeId, tasks],
    )

    const activeSection = useMemo(
        () =>
            activeType === 'section'
                ? sections.find((s) => s.id === activeId) ?? null
                : null,
        [activeType, activeId, sections],
    )

    const sortableItems = useMemo(
        () => sections.map((s) => sectionDomId(s.id)),
        [sections],
    )

    const isDraggingTask = activeType === 'task'
    const disableDropForSections = activeType === 'section'

    return {
        // refs & sensors
        sensors,
        rootRef,
        viewportEl,

        // state
        activeId,
        activeType,
        activeTask,
        activeSection,
        sortableItems,
        isDraggingTask,
        disableDropForSections,

        // handlers
        handleDragStart,
        handleDragOver,
        handleDragEnd,
    }
}
