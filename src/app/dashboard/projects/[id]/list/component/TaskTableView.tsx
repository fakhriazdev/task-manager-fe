'use client'

import { useEffect, useRef, useState } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table } from '@/components/ui/table'
import {TaskTableCols, TaskTableHead,} from './TaskTableHead' // ganti ke export yg kamu punya
import { SectionTBody, type SectionVM } from './SectionTBody'
import { UnlocatedTBody } from './UnlocatedTBody'
import type { TaskTRProps } from './TaskRow'
import { TABLE_MIN_W } from '@/app/dashboard/projects/[id]/list/types/TaskTable.const'

// bentuk task row mengikuti komponen TaskRow
type TaskRow = TaskTRProps['task']

export function TaskTableView({
                                  sections,
                                  grouped,
                                  unlocatedTasks,
                                  renderDnD,
                                  projectId,
                                  isDraggingTask,
                                  disableDropForSections,
                                  onViewportReady,
                              }: {
    sections: SectionVM[]
    grouped: Record<string, TaskRow[]>
    unlocatedTasks: TaskRow[]
    renderDnD?: (children: React.ReactNode) => React.ReactNode
    disableDropForSections?: boolean
    isDraggingTask?: boolean
    projectId?: string
    onViewportReady?: (el: HTMLElement | null) => void
}) {
    // === collapsed state ===
    const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

    useEffect(() => {
        try {
            const raw = localStorage.getItem('task_sections_collapsed')
            if (!raw) return
            const arr: unknown = JSON.parse(raw)
            if (Array.isArray(arr) && arr.every(x => typeof x === 'string')) {
                setCollapsed(new Set(arr as string[]))
            }
        } catch {/* ignore */}
    }, [])

    useEffect(() => {
        try {
            localStorage.setItem('task_sections_collapsed', JSON.stringify([...collapsed]))
        } catch {/* ignore */}
    }, [collapsed])

    // bersihkan id collapsed yang tidak ada di data
    useEffect(() => {
        if (!sections?.length) return
        const valid = new Set(sections.map(s => s.id))
        setCollapsed(prev => {
            let changed = false
            const next = new Set<string>()
            prev.forEach(id => {
                if (valid.has(id)) next.add(id)
                else changed = true
            })
            return changed ? next : prev
        })
    }, [sections])

    const onToggle = (id: string) =>
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })

    // === expose viewport ScrollArea ke parent ===
    const rootRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        const vp = rootRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]'
        ) as HTMLElement | null
        onViewportReady?.(vp ?? null)
    }, [onViewportReady])

    // === table UI ===
    const table = (
        <ScrollArea ref={rootRef} className="w-full">
            <div className={TABLE_MIN_W}>
                <Table className="table-fixed">
                    <TaskTableCols />
                    <TaskTableHead
                    />

                    {/* Unlocated dirender jika ada task atau saat drag agar tetap ada zona drop */}
                    {(unlocatedTasks.length > 0 || isDraggingTask) && (
                        <UnlocatedTBody
                            tasks={unlocatedTasks}
                            disableDrop={!!disableDropForSections}
                            isDraggingTask={!!isDraggingTask}
                        />
                    )}

                    {sections.map(sec => (
                        <SectionTBody
                            key={sec.id}
                            projectId={projectId}
                            section={sec}
                            tasks={grouped[sec.id] ?? []}
                            disableDrop={!!disableDropForSections}
                            collapsed={collapsed.has(sec.id)}
                            onToggle={onToggle}
                            isDraggingTask={!!isDraggingTask}
                        />
                    ))}
                </Table>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )

    return renderDnD ? <>{renderDnD(table)}</> : table
}
