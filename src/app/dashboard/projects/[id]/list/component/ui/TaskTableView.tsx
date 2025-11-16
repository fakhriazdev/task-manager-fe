'use client'

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table } from '@/components/ui/table'
import { TaskTableHead } from './TaskTableHead'
import { SectionTBody, type SectionVM } from '@/app/dashboard/projects/[id]/list/component/ui/section/SectionTBody'
import { UnlocatedTBody } from '@/app/dashboard/projects/[id]/list/component/ui/rows/UnlocatedTBody'
import { TABLE_MIN_W } from '@/app/dashboard/projects/[id]/list/types/TaskTable.const'
import AddSection from '@/app/dashboard/projects/[id]/list/component/ui/section/AddSection'
import { Task } from '@/lib/project/projectTypes'
import {useProjectPermission} from "@/hooks/useProjectPermission";

/* =========================
   Constants & Utils
   ========================= */
const LS_COLLAPSE_KEY = 'task_sections_collapsed'
const RADIX_VP_SELECTOR = '[data-radix-scroll-area-viewport]'

function readCollapsedFromLS(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
        const raw = localStorage.getItem(LS_COLLAPSE_KEY)
        if (!raw) return new Set()
        const arr = JSON.parse(raw)
        return Array.isArray(arr) && arr.every((x) => typeof x === 'string') ? new Set(arr) : new Set()
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

/* =========================
   Types
   ========================= */
type Props = {
    sections: SectionVM[]
    grouped: Record<string, Task[]>
    unlocatedTasks: Task[]
    renderDnD?: (children: React.ReactNode) => React.ReactNode
    disableDropForSections?: boolean
    isDraggingTask?: boolean
    projectId: string
    onViewportReady?: (el: HTMLElement | null) => void
}

/* =========================
   Component
   ========================= */
export const TaskTableView = memo(function TaskTableView({
                                                             sections,
                                                             grouped,
                                                             unlocatedTasks,
                                                             renderDnD,
                                                             projectId,
                                                             isDraggingTask = false,
                                                             disableDropForSections = false,
                                                             onViewportReady,
                                                         }: Props) {
    // Collapsed state (persisted)
    const [collapsed, setCollapsed] = useState<Set<string>>(() => readCollapsedFromLS())

    // Sync write → LS whenever collapsed changes
    useEffect(() => {
        writeCollapsedToLS(collapsed)
    }, [collapsed])

    // Clean up collapsed ids if sections change (remove orphan IDs)
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
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    // Expose viewport element (for DnD auto-scroll adjustment)
    const rootRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        const vp = rootRef.current?.querySelector(RADIX_VP_SELECTOR) as HTMLElement | null
        onViewportReady?.(vp ?? null)
        // no cleanup required; parent will ignore null unless needed
    }, [onViewportReady])

    // Derived UI flags
    const showUnlocated = useMemo(
        () => unlocatedTasks.length > 0 || isDraggingTask,
        [unlocatedTasks.length, isDraggingTask],
    )


    const sectionRows = useMemo(
        () =>
            sections.map((sec) => (
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
    const { hasAccess } = useProjectPermission(projectId, ['OWNER', 'EDITOR',])

    const table = (
        <ScrollArea ref={rootRef} className="w-full">
            <div className={TABLE_MIN_W}>
                <Table className="table-fixed">
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
                    {hasAccess && (
                        <AddSection projectId={projectId} colSpan={5} />
                    )}

                </Table>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )

    return renderDnD ? <>{renderDnD(table)}</> : table
})
