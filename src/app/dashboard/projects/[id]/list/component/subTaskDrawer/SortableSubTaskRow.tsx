"use client";

import { cn, formatDateTime2, isOverdue } from "@/lib/utils";
import { Calendar as CalendarIcon, GripVertical, Trash2, User as UserIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    type KeyboardEventHandler,
    type CSSProperties,
} from "react";
import type { SubTask } from "@/lib/project/projectTypes";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

type Props = {
    item: SubTask;
    taskId: string;
    handlers: {
        addSubtask: ReturnType<typeof import("@/lib/project/projectAction").useAddSubTask>;
        updateSubtask: ReturnType<typeof import("@/lib/project/projectAction").useUpdateSubTask>;
        deleteSubtask: ReturnType<typeof import("@/lib/project/projectAction").useDeleteSubTask>;
        setItems: (fn: (prev: SubTask[]) => SubTask[]) => void;
    };
};

const dashedBtn =
    "size-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center hover:border-muted-foreground transition";

export default function SortableSubtaskRow({ item, handlers, taskId }: Props) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging, isSorting } =
        useSortable({ id: item.id });

    const { addSubtask, updateSubtask, deleteSubtask, setItems } = handlers;

    const [editing, setEditing] = useState(Boolean(item._isNew || !item.name));
    const [value, setValue] = useState(item.name ?? "");
    const [dueDate, setDueDate] = useState<Date | undefined>(item.dueDate ? new Date(item.dueDate) : undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // ====== Refs untuk field item agar deps callback stabil ======
    const itemIdRef = useRef(item.id);
    const itemIsNewRef = useRef(!!item._isNew);
    const itemNameRef = useRef(item.name ?? "");
    const itemStatusRef = useRef(!!item.status);
    const itemSnapshotRef = useRef(item); // untuk rollback delete

    useEffect(() => {
        itemIdRef.current = item.id;
        itemIsNewRef.current = !!item._isNew;
        itemNameRef.current = item.name ?? "";
        itemStatusRef.current = !!item.status;
        itemSnapshotRef.current = item;
    }, [item]);

    // ====== Sync props -> state ======
    useEffect(() => {
        setValue(item.name ?? "");
    }, [item.name]);

    useEffect(() => {
        setDueDate(item.dueDate ? new Date(item.dueDate) : undefined);
    }, [item.dueDate]);

    // Fokus saat masuk mode edit
    useEffect(() => {
        if (!editing) return;
        const t = setTimeout(() => inputRef.current?.focus(), 60);
        return () => clearTimeout(t);
    }, [editing]);

    // === Debounce rename (payload minimal: hanya name)
    const renameHandler = useCallback(
        (subtaskId: string, name: string) => {
            const n = name.trim();
            if (!n || itemIsNewRef.current) return;
            updateSubtask.mutate({
                taskId,
                subtaskId,
                payload: { name: n },
            });
        },
        [taskId, updateSubtask]
    );

    const debouncedRename = useDebouncedCallback<[string, string]>(renameHandler, 400);

    useEffect(() => {
        return () => {
            debouncedRename.cancel();
        };
    }, [debouncedRename]);

    // Worker async untuk commit
    const commitNameAsync = useCallback(
        async () => {
            const trimmed = value.trim();

            // batalkan debounce yang masih antri
            debouncedRename.cancel();

            if (!trimmed) {
                if (itemIsNewRef.current) {
                    setItems((prev) => prev.filter((it) => it.id !== itemIdRef.current));
                } else {
                    setValue(itemNameRef.current);
                }
                setEditing(false);
                return;
            }

            try {
                if (itemIsNewRef.current) {
                    const res = await addSubtask.mutateAsync({ name: trimmed });
                    const realId = res?.data?.id;
                    if (realId) {
                        setItems((prev) =>
                            prev.map((it) =>
                                it.id === itemIdRef.current ? { ...it, id: realId, name: trimmed, _isNew: false } : it
                            )
                        );
                    }
                } else {
                    await updateSubtask.mutateAsync({
                        taskId,
                        subtaskId: itemIdRef.current,
                        payload: { name: trimmed },
                    });
                    // sync drawer lokal
                    setItems((prev) => prev.map((it) => (it.id === itemIdRef.current ? { ...it, name: trimmed } : it)));
                }
                setEditing(false);
            } catch (err) {
                console.error("Commit subtask failed:", err);
            }
        },
        [addSubtask, debouncedRename, setItems, taskId, updateSubtask, value]
    );

    const toggleAsync = useCallback(
        async () => {
            const newStatus = !itemStatusRef.current;

            // optimistic drawer
            setItems((prev) => prev.map((it) => (it.id === itemIdRef.current ? { ...it, status: newStatus } : it)));

            if (itemIsNewRef.current) return;
            try {
                await updateSubtask.mutateAsync({
                    taskId,
                    subtaskId: itemIdRef.current,
                    payload: { status: newStatus },
                });
            } catch (err) {
                console.error("Toggle subtask failed:", err);
                setItems((prev) => prev.map((it) => (it.id === itemIdRef.current ? { ...it, status: !newStatus } : it)));
            }
        },
        [setItems, updateSubtask, taskId]
    );

    const removeAsync = useCallback(
        async () => {
            // optimistic
            setItems((prev) => prev.filter((it) => it.id !== itemIdRef.current));
            if (!itemIsNewRef.current) {
                try {
                    await deleteSubtask.mutateAsync({
                        taskId,
                        subtaskId: itemIdRef.current,
                    });
                } catch (e) {
                    console.log(e);
                    // rollback
                    setItems((prev) => [...prev, itemSnapshotRef.current]);
                }
            }
        },
        [deleteSubtask, setItems, taskId]
    );

    const clearDateAsync = useCallback(
        async (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setDueDate(undefined);
            setItems((prev) => prev.map((it) => (it.id === itemIdRef.current ? { ...it, dueDate: null } : it)));
            setIsCalendarOpen(false);

            if (!itemIsNewRef.current) {
                try {
                    await updateSubtask.mutateAsync({
                        taskId,
                        subtaskId: itemIdRef.current,
                        payload: { dueDate: null },
                    });
                } catch (err) {
                    console.error("Clear due date failed:", err);
                }
            }
        },
        [setItems, updateSubtask, taskId]
    );

    const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                void commitNameAsync();
            } else if (e.key === "Escape") {
                debouncedRename.cancel();
                setEditing(false);
                setValue(itemNameRef.current);
            }
        },
        [commitNameAsync, debouncedRename]
    );

    const style: CSSProperties = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging || isSorting ? 0.7 : 1,
        }),
        [transform, transition, isDragging, isSorting]
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-1.5 group py-1.5 px-2 bg-card border-y border-border transition-all duration-200 ease-in-out",
                "hover:bg-accent/50",
                (isDragging || isSorting) && "ring-2 ring-primary/30"
            )}
            aria-label="Subtask row"
        >
            {/* Drag handle */}
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="size-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
                aria-label="Drag handle"
            >
                <GripVertical className="size-4" />
            </button>

            {/* Checkbox */}
            <div
                role="checkbox"
                tabIndex={0}
                aria-checked={!!item.status}
                onClick={() => {
                    void toggleAsync();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        void toggleAsync();
                    }
                }}
                className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer",
                    item.status
                        ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600"
                        : "border-dashed border-muted-foreground/60 hover:border-emerald-500 hover:bg-emerald-500/10"
                )}
                aria-label={item.status ? "Tandai belum selesai" : "Tandai selesai"}
            />

            {/* Nama */}
            <div className="flex-1">
                {editing ? (
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => {
                            const v = e.target.value;
                            setValue(v);
                            if (!itemIsNewRef.current) debouncedRename(itemIdRef.current, v);
                        }}
                        onBlur={() => {
                            void commitNameAsync();
                        }}
                        onKeyDown={onKeyDown}
                        placeholder="Nama subtugas..."
                        className="w-60 ml-1 p-0 text-sm bg-transparent border-b outline-none border-transparent focus:border-primary/40 transition-all"
                        aria-label="Ubah nama subtugas"
                    />
                ) : (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setEditing(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setEditing(true);
                            }
                        }}
                        className={cn(
                            "w-60 flex-1 text-left text-sm truncate px-1 cursor-text rounded-sm transition-all hover:bg-accent/30",
                            item.status && "line-through text-muted-foreground"
                        )}
                        title={item.name}
                        aria-label="Edit nama subtugas"
                    >
                        {item.name || <span className="text-muted-foreground/50">Nama subtugas...</span>}
                    </div>
                )}
            </div>

            {/* Assignee placeholder */}
            <div
                role="button"
                tabIndex={0}
                className={cn(
                    dashedBtn,
                    "size-7 text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                )}
                onClick={() => {
                    /* open assignee modal */
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        /* open assignee modal */
                    }
                }}
                aria-label="Pilih penerima subtugas"
                title="Pilih penerima subtugas"
            >
                <UserIcon className="size-4" />
            </div>

            {/* Delete */}
            <button
                type="button"
                className={cn(
                    "size-7 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200",
                    "text-red-500 border-red-500/60 hover:text-red-600 hover:border-red-600 hover:bg-red-600/10",
                    "opacity-0 group-hover:opacity-100 cursor-pointer"
                )}
                onClick={() => {
                    void removeAsync();
                }}
                aria-label="Hapus subtugas"
                title="Hapus subtugas"
            >
                <Trash2 className="size-3.5 pointer-events-none" />
            </button>

            {/* Date picker */}
            <div className="flex items-center gap-2 relative">
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        {dueDate ? (
                            <div className="flex items-center gap-1">
                <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsCalendarOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setIsCalendarOpen(true);
                        }
                    }}
                    className="font-medium text-foreground text-sm cursor-pointer hover:text-primary transition-colors"
                    title="Ubah tenggat subtugas"
                >
                  <p className={cn("text-xs", isOverdue(dueDate) && "text-red-500")}>
                    {formatDateTime2(dueDate)}
                  </p>
                </span>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        void clearDateAsync(e);
                                    }}
                                    className="text-muted-foreground/60 hover:text-destructive transition-colors p-0.5 rounded-md"
                                    aria-label="Hapus tanggal"
                                    title="Hapus tanggal"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                role="button"
                                tabIndex={0}
                                className={cn(
                                    dashedBtn,
                                    "px-2 rounded-full justify-center text-xs text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer size-7 flex items-center"
                                )}
                                onClick={() => setIsCalendarOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setIsCalendarOpen(true);
                                    }
                                }}
                                aria-label="Set tanggal subtugas"
                                title="Set tanggal subtugas"
                            >
                                <CalendarIcon className="size-4" />
                            </div>
                        )}
                    </PopoverTrigger>

                    <PopoverContent className="p-2 w-auto" align="end" side="top" sideOffset={8} avoidCollisions={false}>
                        <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={(date: Date | undefined) => {
                                setDueDate(date);
                                // simpan ke items sebagai string ISO (bukan Date)
                                setItems((prev) =>
                                    prev.map((it) =>
                                        it.id === itemIdRef.current ? { ...it, dueDate: date ? date.toISOString() : null } : it
                                    )
                                );

                                if (!itemIsNewRef.current) {
                                    void updateSubtask
                                        .mutateAsync({
                                            taskId,
                                            subtaskId: itemIdRef.current,
                                            payload: { dueDate: date ? date.toISOString() : null },
                                        })
                                        .catch((err) => console.error("Update due date failed:", err));
                                }
                                if (date) setIsCalendarOpen(false);
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
