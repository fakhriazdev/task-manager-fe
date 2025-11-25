'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/project/table-project';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown } from 'lucide-react';
import { TaskRow } from '@/app/dashboard/projects/[id]/list/component/ui/rows/TaskRow';
import { useUpdateSection } from '@/lib/project/projectAction';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import SectionRowAction from '@/app/dashboard/projects/[id]/list/component/ui/section/SectionRowAction';
import type { Section } from '../../../types/task';
import { Task } from "@/lib/project/projectTypes";
import AddTaskRow from '@/app/dashboard/projects/[id]/list/component/ui/rows/AddTaskRow';
import {useProjectPermission} from "@/hooks/useProjectPermission";
import { cn } from '@/lib/utils';

export type SectionVM = { id: string; name: string };

const SectionName = memo(({
                              name,
                              editing,
                              tempName,
                              onEdit,
                              onTempNameChange,
                              onCommit,
                              onCancel,
                              inputRef,
                          }: {
    name: string;
    editing: boolean;
    tempName: string;
    onEdit: () => void;
    onTempNameChange: (value: string) => void;
    onCommit: () => void;
    onCancel: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
    return (
        <div className="relative py-1">
            {!editing && (
                <button
                    type="button"
                    onClick={onEdit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEdit();
                        }
                    }}
                    title={name}
                    className="inline-flex max-w-full items-center rounded px-1 py-auto text-left font-medium text-sm
                     hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    <span className="truncate tracking-wide text-[16px]">{name}</span>
                </button>
            )}

            {editing && (
                <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => onTempNameChange(e.target.value)}
                    onBlur={onCommit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); onCommit(); }
                        if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
                    }}
                    aria-label="Edit section name"
                    className="w-40 h-full bg-transparent border-primary border-2 rounded text-sm px-2 py-1
                     focus:outline-none focus:ring-0"
                />
            )}
        </div>
    );
});
SectionName.displayName = 'SectionName';

/**
 * SectionTBody - Renders pure TableBody without SortableContext wrapper
 * Parent component must wrap this with SortableContext
 */
export function SectionTBody({
                                 section,
                                 tasks,
                                 projectId,
                                 disableDrop,
                                 collapsed,
                                 onToggle,
                                 isDraggingTask,
                             }: {
    section: SectionVM;
    tasks: Task[];
    projectId: string;
    disableDrop?: boolean;
    collapsed?: boolean;
    onToggle?: (id: string) => void;
    isDraggingTask?: boolean;
}) {
    const droppableId = `droppable-section-${section.id}`;
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: droppableId,
        data: { type: 'task-container' as const, sectionId: section.id },
        disabled: !!disableDrop,
    });

    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState(section.name);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastSavedNameRef = useRef(section.name);

    const { mutate: renameSection, isPending } = useUpdateSection();
    const { hasAccess } = useProjectPermission(projectId, ['OWNER', 'EDITOR',])

    const debouncedSave = useDebouncedCallback((pId: string, id: string, name: string) => {
        if (!pId || !name.trim()) return;
        lastSavedNameRef.current = name;
        renameSection({ projectId: pId, id, name });
    }, 500);

    useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

    useEffect(() => {
        setEditing(false);
        setTempName(section.name);
        lastSavedNameRef.current = section.name;
    }, [section.id, section.name]);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const handleNameChange = (val: string) => {
        setTempName(val);
        const trimmed = val.trim();
        if (projectId && trimmed && trimmed !== lastSavedNameRef.current && !isPending) {
            debouncedSave(projectId, section.id, trimmed);
        }
    };

    const commit = () => {
        const trimmed = tempName.trim();
        setEditing(false);
        if (!trimmed) {
            setTempName(lastSavedNameRef.current);
            return;
        }
        if (projectId && trimmed !== lastSavedNameRef.current) {
            debouncedSave.cancel();
            lastSavedNameRef.current = trimmed;
            if (!isPending) renameSection({ projectId, id: section.id, name: trimmed });
        }
    };

    const cancel = () => {
        setEditing(false);
        setTempName(lastSavedNameRef.current);
        debouncedSave.cancel();
    };

    const {
        setNodeRef: setSectionRowRef,
        attributes: sectionAttrs,
        listeners: sectionListeners,
        transform: secTransform,
        transition: secTransition,
        isDragging: sectionDragging,
        setActivatorNodeRef: setSectionHandleRef,
    } = useSortable({
        id: `section-${section.id}`,
        disabled: editing || isPending,
    });

    const secStyle: React.CSSProperties = {
        transform: CSS.Transform.toString(secTransform),
        transition: secTransition,
    };

    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => { if (editing) setMenuOpen(false); }, [editing]);
    useEffect(() => { setMenuOpen(false); }, [section.id]);

    const dragDisabled = disableDrop || editing || isPending;
    const minimalSection: Pick<Section, 'id' | 'name'> = { id: section.id, name: section.name };

    // Combine refs for droppable and sortable
    const combinedRef = (node: HTMLTableSectionElement | null) => {
        setDroppableRef(node);
        setSectionRowRef(node);
    };

    return (
        <TableBody
            ref={combinedRef}
            id={`sec-${section.id}-rows`}
            data-section-id={section.id}
            style={secStyle}
            className={cn(
                isOver && "bg-primary/5 transition-colors",
                sectionDragging && "ring-2 ring-primary/30",
                isPending && "opacity-60",
            )}
        >
            {/* Section Header Row */}
                <TableRow className="bg-transparent divide-x divide-foreground/40">
                    <TableCell colSpan={4}>
                        <div className="flex items-center justify-between">
                            {/* jadikan wrapper ini sebagai group */}
                            <div className="group/name flex items-center min-w-0 flex-1 gap-1">
                                {/* Drag section – tetap boleh, cuma cek dragDisabled */}
                                <button
                                    ref={setSectionHandleRef}
                                    {...(!dragDisabled ? { ...sectionAttrs, ...sectionListeners } : {})}
                                    className={[
                                        // hidden by default
                                        "opacity-0 pointer-events-none",
                                        // show saat hover nama/row
                                        "group-hover/name:opacity-100 group-hover/name:pointer-events-auto",
                                        // aksesibilitas
                                        "focus-visible:opacity-100 focus-visible:pointer-events-auto",
                                        // style lainnya
                                        "shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-transparent rounded transition-opacity",
                                        dragDisabled ? "opacity-40 cursor-not-allowed" : "",
                                    ].join(" ")}
                                    aria-label="Drag section"
                                    title={
                                        dragDisabled
                                            ? "Drag disabled while editing or saving"
                                            : "Drag section"
                                    }
                                    type="button"
                                    disabled={dragDisabled}
                                    onMouseDown={(e) => {
                                        if (editing) e.preventDefault()
                                    }}
                                >
                                    <GripVertical size={16} />
                                </button>

                                {/* Expand / Collapse – boleh untuk semua */}
                                {!editing && (
                                    <button
                                        type="button"
                                        onClick={() => onToggle?.(section.id)}
                                        aria-expanded={!collapsed}
                                        aria-controls={`sec-${section.id}-rows`}
                                        className={[
                                            "p-1 rounded hover:bg-muted focus-visible:outline-none",
                                            menuOpen ? "opacity-100 pointer-events-auto" : "",
                                        ].join(" ")}
                                        title={collapsed ? "Expand section" : "Collapse section"}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${
                                                collapsed ? "-rotate-90" : "rotate-0"
                                            }`}
                                        />
                                    </button>
                                )}

                                <div className="relative flex items-center min-w-0 flex-1">
                                    {/* Nama section – di-lock kalau tidak punya akses */}
                                    <SectionName
                                        name={section.name}
                                        editing={editing && hasAccess}
                                        tempName={tempName}
                                        onEdit={() => {
                                            if (!hasAccess || isPending) return
                                            setEditing(true)
                                        }}
                                        onTempNameChange={(val) => {
                                            if (!hasAccess) return
                                            handleNameChange(val)
                                        }}
                                        onCommit={() => {
                                            if (!hasAccess) {
                                                setEditing(false)
                                                return
                                            }
                                            commit()
                                        }}
                                        onCancel={cancel}
                                        inputRef={inputRef}
                                    />

                                    {/* Section actions (menu) – HANYA kalau punya akses & tidak editing */}
                                    {!editing && hasAccess && (
                                        <div className="ml-2 flex items-center gap-1">
                                            <div
                                                className={[
                                                    "transition-opacity",
                                                    "opacity-0 pointer-events-none",
                                                    "group-hover/name:opacity-100 group-hover/name:pointer-events-auto",
                                                    menuOpen ? "opacity-100 pointer-events-auto" : "",
                                                ].join(" ")}
                                                onMouseDown={(e) => e.stopPropagation()}
                                            >
                                                <SectionRowAction
                                                    currentSection={minimalSection}
                                                    open={menuOpen}
                                                    onOpenChange={setMenuOpen}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info jumlah task – read-only, semua boleh lihat */}
                                {!editing && (
                                    <div className="text-xs text-muted-foreground shrink-0">
                                        {tasks.length} task
                                        {tasks.length !== 1 ? "s" : ""}
                                        {isPending && " • Saving..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>




            {/* Task Rows - NO SortableContext wrapper */}
            {collapsed ? (
                isDraggingTask ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-12 text-center text-xs text-primary">
                            Drop task here
                        </TableCell>
                    </TableRow>
                ) : null
            ) : (
                <>
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            projectId={projectId}
                            disableDrag={!!disableDrop}
                        />
                    ))}
                    {hasAccess && (
                        <AddTaskRow
                            colSpan={4}
                            sectionId={section.id}
                            disabled={!!isDraggingTask}
                        />
                    )}
                </>
            )}
        </TableBody>
    );
}