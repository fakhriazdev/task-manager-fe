'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown } from 'lucide-react';
import { TaskRow } from './TaskRow';
import { useUpdateSection } from '@/lib/project/projectAction';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

import type { TaskTRProps } from './TaskRow';
type TaskVM = TaskTRProps['task'];

export type SectionVM = { id: string; name: string };

/** Editable Section Name */
const SectionName = memo(
    ({
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
            <div className="relative min-h-[1.25rem]">
                {/* View layer */}
                <span
                    tabIndex={0}
                    aria-hidden={editing ? true : undefined}
                    className={`absolute inset-0 flex items-center font-semibold text-sm transition-opacity duration-150 ease-out ${
                        editing ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                    }`}
                    title={name}
                    onFocus={onEdit}
                    onClick={onEdit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEdit();
                        }
                    }}
                >
          <span className="px-1 -mx-1 py-0.5 rounded focus:ring-2 focus:ring-primary/40 outline-none">
            {name}
          </span>
        </span>

                {/* Edit layer */}
                <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => onTempNameChange(e.target.value)}
                    onBlur={onCommit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onCommit();
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            onCancel();
                        }
                    }}
                    aria-label="Edit section name"
                    className={`absolute inset-0 w-full font-semibold text-sm bg-transparent border border-border rounded px-2 py-1 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-[opacity,box-shadow,border-color] duration-150 ease-out ${
                        editing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                />
            </div>
        );
    }
);
SectionName.displayName = 'SectionName';

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
    tasks: TaskVM[];
    projectId?: string;
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

    // Inline edit state
    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState(section.name);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastSavedNameRef = useRef(section.name);

    const { mutate: renameSection, isPending } = useUpdateSection();

    // Debounced save
    const debouncedSave = useDebouncedCallback((pId: string, id: string, name: string) => {
        if (!pId || !name.trim()) return;
        lastSavedNameRef.current = name;
        renameSection({ projectId: pId, id, name });
    }, 500);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => debouncedSave.cancel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync saat section.id berubah (mis. pindah halaman / re-order yang ganti referensi)
    useEffect(() => {
        setEditing(false);
        setTempName(section.name);
        lastSavedNameRef.current = section.name;
    }, [section.id, section.name]);

    // Autofocus saat mulai edit
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    // Handle name change dengan debounce
    const handleNameChange = (val: string) => {
        setTempName(val);
        const trimmed = val.trim();

        // Hanya save jika berbeda dari terakhir yang disimpan, tidak kosong, dan tidak sedang ada request berjalan
        if (projectId && trimmed && trimmed !== lastSavedNameRef.current && !isPending) {
            debouncedSave(projectId, section.id, trimmed);
        }
    };

    // Commit changes (onBlur/Enter)
    const commit = () => {
        const trimmed = tempName.trim();
        setEditing(false);

        // Jika kosong, kembalikan ke nama terakhir yang valid
        if (!trimmed) {
            setTempName(lastSavedNameRef.current);
            return;
        }

        // Jika ada perubahan, cancel debounce dan save langsung
        if (projectId && trimmed !== lastSavedNameRef.current) {
            debouncedSave.cancel();
            lastSavedNameRef.current = trimmed;
            if (!isPending) {
                renameSection({ projectId, id: section.id, name: trimmed });
            }
        }
    };

    // Cancel editing (Escape)
    const cancel = () => {
        setEditing(false);
        setTempName(lastSavedNameRef.current);
        debouncedSave.cancel();
    };

    // Draggable untuk header section (reorder section)
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

    const dragDisabled = disableDrop || editing || isPending;

    return (
        <TableBody
            ref={setDroppableRef as unknown as React.Ref<HTMLTableSectionElement>}
            id={`sec-${section.id}-rows`}
            data-section-id={section.id}
            className={isOver ? 'bg-primary/5 transition-colors' : ''}
        >
            {/* Header section: drag + editable title + toggle */}
            <TableRow
                ref={setSectionRowRef as unknown as React.Ref<HTMLTableRowElement>}
                style={secStyle}
                className={`bg-card ${sectionDragging ? 'ring-2 ring-primary/30' : ''} ${isPending ? 'opacity-60' : ''}`}
            >
                <TableCell colSpan={3}>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <button
                                ref={setSectionHandleRef}
                                {...(!dragDisabled ? { ...sectionAttrs, ...sectionListeners } : {})}
                                className={`shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted rounded p-0.5 transition-opacity ${
                                    dragDisabled ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                                aria-label="Drag section"
                                title={dragDisabled ? 'Drag disabled while editing or saving' : 'Drag section'}
                                type="button"
                                disabled={dragDisabled}
                                // Agar klik handle tidak memicu blur input saat sedang edit
                                onMouseDown={(e) => {
                                    if (editing) e.preventDefault();
                                }}
                            >
                                <GripVertical size={16} />
                            </button>

                            {/* Editable section name */}
                            <div className="flex-1 min-w-0">
                                <SectionName
                                    name={section.name}          // tampilkan nama sumber (bukan temp) di view layer
                                    editing={editing}
                                    tempName={tempName}          // input terkontrol
                                    onEdit={() => !isPending && setEditing(true)}
                                    onTempNameChange={handleNameChange}
                                    onCommit={commit}
                                    onCancel={cancel}
                                    inputRef={inputRef}
                                />
                            </div>

                            {!editing && (
                                <div className="text-xs text-muted-foreground shrink-0">
                                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                                    {isPending && ' • Saving...'}
                                </div>
                            )}
                        </div>

                        {/* Toggle collapse */}
                        {!editing && (
                            <button
                                type="button"
                                onClick={() => onToggle?.(section.id)}
                                aria-expanded={!collapsed}
                                aria-controls={`sec-${section.id}-rows`}
                                className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground rounded px-2 py-1 transition-colors"
                                title={collapsed ? 'Expand section' : 'Collapse section'}
                            >
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${collapsed ? '-rotate-90' : 'rotate-0'}`}
                                />
                                {collapsed ? 'Expand' : 'Collapse'}
                            </button>
                        )}
                    </div>
                </TableCell>
            </TableRow>

            {/* Body rows */}
            <SortableContext
                items={collapsed ? [] : tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {collapsed ? (
                    isDraggingTask ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-12 text-center text-xs text-muted-foreground">
                                Drop task here
                            </TableCell>
                        </TableRow>
                    ) : null
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskRow key={task.id} task={task} projectId={projectId} disableDrag={!!disableDrop} />
                    ))
                ) : (
                    <TableRow className="opacity-70 bg-sidebar">
                        <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                            {isDraggingTask ? 'Drop task here' : 'No tasks'}
                        </TableCell>
                    </TableRow>
                )}
            </SortableContext>
        </TableBody>
    );
}
