"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, MessageCircle } from "lucide-react";
import { initials, COLS_GRID, ROW_HSEP, COL_SEP } from "../types/TaskTable.const";
import { useUpdateTask } from "@/lib/project/projectAction";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import { Button } from "@/components/ui/button";
import { Assignees } from "@/app/dashboard/projects/[id]/list/types/task";

export type TaskTRProps = {
    task: {
        id: string;
        name: string;
        desc: string | null;
        dueDate: string | null;
        assignees: Assignees[] | null;
        creator: { nama: string };
        status: boolean;
        comments?: number;
    };
    projectId?: string;
    disableDrag?: boolean;
};

/** TaskName: seamless editing + optimistic update */
const TaskName = memo(
    ({
         name,
         status,
         editing,
         tempName,
         onEdit,
         onTempNameChange,
         onCommit,
         onCancel,
         inputRef,
     }: {
        name: string;
        status?: boolean;
        editing: boolean;
        tempName: string;
        onEdit: () => void;
        onTempNameChange: (value: string) => void;
        onCommit: () => void;
        onCancel: () => void;
        inputRef: React.RefObject<HTMLInputElement | null>;
    }) => {
        return (
            <div
                className="relative min-h-[1.5rem] max-w-40 cursor-text"
                style={{ contain: "layout paint", backfaceVisibility: "hidden", transform: "translateZ(0)" }}
            >
                {/* View layer */}
                <span
                    tabIndex={0}
                    aria-hidden={editing || undefined}
                    className={`absolute w-full inset-0 flex items-center truncate 
                      transition-opacity duration-150 ease-out
                      ${editing ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}
                      ${status ? "line-through text-muted-foreground" : ""}`}
                    title={name}
                    onFocus={onEdit}
                    onClick={onEdit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
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
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onCommit();
                        }
                        if (e.key === "Escape") {
                            e.preventDefault();
                            onCancel();
                        }
                    }}
                    aria-label="Edit task name"
                    className={`absolute inset-0 w-48
                      bg-secondary rounded text-sm
                      focus:ring-0  focus:border-transparent focus:outline-hidden
                      transition-[opacity,box-shadow,border-color] duration-150 ease-out
                      ${editing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                />
            </div>
        );
    }
);
TaskName.displayName = "TaskName";

const AssigneeList = memo(({ assignees }: { assignees: Assignees[] }) => {
    const top3 = assignees.slice(0, 3);
    const extra = Math.max(assignees.length - 3, 0);

    return (
        <div className="h-full flex items-center -space-x-2">
            {top3.map((a) => (
                <Avatar key={a.nik} className="h-6 w-6 ring-2 ring-background" title={a.name}>
                    <AvatarImage src="" alt={a.name} draggable={false} />
                    <AvatarFallback className="text-[10px] font-semibold">{initials(a.name)}</AvatarFallback>
                </Avatar>
            ))}
            {extra > 0 && (
                <Avatar className="h-6 w-6 ring-2 ring-background bg-muted" title={`+${extra} more`}>
                    <AvatarFallback className="text-[10px]">+{extra}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
});
AssigneeList.displayName = "AssigneeList";

export const TaskRow = memo(
    ({ task, projectId, disableDrag }: TaskTRProps) => {
        const { setNodeRef, transform, transition, isDragging, attributes, listeners, setActivatorNodeRef } =
            useSortable({ id: task.id, disabled: !!disableDrag });

        // ✅ Ambil state & actions via selector
        const setOpen = useProjectStore((s) => s.setOpen);
        const setCurrentRow = useProjectStore((s) => s.setCurrentRow);

        const style: React.CSSProperties = {
            transform: CSS.Transform.toString(transform),
            transition,
            willChange: isDragging ? "transform" : "auto",
        };

        // State editing
        const [editing, setEditing] = useState(false);
        const [tempName, setTempName] = useState(task.name);
        const inputRef = useRef<HTMLInputElement>(null);

        // Track committed name & pending save
        const committedNameRef = useRef(task.name);
        const pendingSaveRef = useRef<string | null>(null);

        const { mutate: renameTask } = useUpdateTask(projectId);

        // Debounced save (saat mengetik)
        const debouncedSave = useDebouncedCallback<[string, string]>((id, name) => {
            pendingSaveRef.current = name;
            renameTask({ type: 'rename', id, name });
        }, 500);

        // Sinkron dari server (saat tidak sedang edit & tidak ada pending yang bentrok)
        useEffect(() => {
            if (!editing && pendingSaveRef.current === null && task.name !== committedNameRef.current) {
                committedNameRef.current = task.name;
                setTempName(task.name);
            }

            // pending -> match dgn server
            if (pendingSaveRef.current === task.name) {
                pendingSaveRef.current = null;
                committedNameRef.current = task.name;
            }
        }, [task.name, editing]);

        // Autofocus saat masuk edit
        useEffect(() => {
            if (editing && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, [editing]);

        // Handle perubahan teks
        const handleNameChange = (val: string) => {
            setTempName(val);

            const trimmed = val.trim();
            if (trimmed && trimmed !== committedNameRef.current) {
                debouncedSave(task.id, trimmed);
            }
        };

        // Commit (onBlur / Enter)
        const commit = () => {
            const trimmed = tempName.trim();
            setEditing(false);

            if (!trimmed) {
                setTempName(committedNameRef.current);
                return;
            }

            if (trimmed !== committedNameRef.current) {
                debouncedSave.cancel();
                pendingSaveRef.current = trimmed;
                committedNameRef.current = trimmed; // optimistic
                renameTask({ type: 'rename', id: task.id, name: trimmed });
            }
        };

        // Cancel (Escape)
        const cancel = () => {
            setEditing(false);
            setTempName(committedNameRef.current);
            debouncedSave.cancel();
        };

        const dragDisabled = disableDrag || editing;

        return (
            <TableRow className="select-none" aria-grabbed={isDragging || undefined}>
                <TableCell colSpan={3} className="p-0">
                    <div
                        ref={setNodeRef}
                        style={style}
                        className={`${COLS_GRID} ${COL_SEP} ${ROW_HSEP}
                        transform-gpu
                        ${isDragging ? "ring-2 ring-primary/30 bg-secondary/60" : "hover:bg-muted/40"}
                        transition-colors duration-150`}
                    >
                        {/* Kolom 1: Nama + handle + comments */}
                        <div className="h-full py-2 pr-3 pl-5">
                            <div className="h-full flex items-center gap-2 min-w-0 group/item">
                                {/* Drag handle */}
                                <button
                                    ref={setActivatorNodeRef}
                                    {...(!dragDisabled ? { ...attributes, ...listeners } : {})}
                                    style={!dragDisabled ? { touchAction: "none" } : undefined}
                                    className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted
                             transition-colors duration-150 cursor-grab active:cursor-grabbing
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label={dragDisabled ? "Drag dinonaktifkan" : "Drag task"}
                                    disabled={dragDisabled}
                                    type="button"
                                    data-dnd-handle
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") e.preventDefault();
                                    }}
                                >
                                    <GripVertical size={16} />
                                </button>

                                {/* Konten */}
                                <div className="flex-1 min-w-0">
                                    <TaskName
                                        name={tempName}
                                        status={task.status}
                                        editing={editing}
                                        tempName={tempName}
                                        onEdit={() => setEditing(true)}
                                        onTempNameChange={handleNameChange}
                                        onCommit={commit}
                                        onCancel={cancel}
                                        inputRef={inputRef}
                                    />

                                    {!editing && typeof task.comments === "number" && task.comments > 0 && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle size={12} />
                                            {task.comments}
                    </span>
                                    )}
                                </div>

                                {/* ✅ Tombol detail – simpan ID saja */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    className="
                    w-7 h-7 rounded-full transition
                    opacity-0 translate-x-2 pointer-events-none
                    group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:pointer-events-auto
                    focus:opacity-100 focus:translate-x-0 focus:pointer-events-auto
                    focus-visible:outline-none
                  "
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // ✅ Simpan ID saja, bukan object lengkap
                                        setCurrentRow(task.id);
                                        setOpen("detail");
                                    }}
                                    aria-label="Lihat detail task"
                                    title="Lihat detail"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Kolom 2: Assignee */}
                        <div className="h-full py-2 px-2">
                            <AssigneeList assignees={task.assignees ?? []} />
                        </div>

                        {/* Kolom 3: Creator */}
                        <div className="h-full py-2 pl-2">
                            {task.creator?.nama && (
                                <Avatar className="h-6 w-6 ring-2 ring-background" title={`Creator ${task.creator.nama}`}>
                                    <AvatarImage src="" alt={task.creator.nama} draggable={false} />
                                    <AvatarFallback className="text-[10px] font-semibold">
                                        {initials(task.creator.nama)}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        );
    },
    (prevProps, nextProps) =>
        prevProps.task.id === nextProps.task.id &&
        prevProps.task.name === nextProps.task.name &&
        prevProps.task.status === nextProps.task.status &&
        prevProps.task.comments === nextProps.task.comments &&
        prevProps.disableDrag === nextProps.disableDrag &&
        JSON.stringify(prevProps.task.assignees) === JSON.stringify(nextProps.task.assignees)
);

TaskRow.displayName = "TaskRow";