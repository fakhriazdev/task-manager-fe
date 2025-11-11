"use client";

import * as React from "react";
import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandEmpty } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, UserRoundPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectDetailAction } from "@/lib/project/projectAction";

// ===== Types =====
export type MemberFromProject = { nik: string; nama: string };   // fetched members
export type AssigneeInput = { nik: string; name: string };        // API shape

export type TaskLite = {
    id: string;
    assignees?: AssigneeInput[] | null; // server bisa null -> kita normalize
};

export type AssigneePickerNikNamaProps = {
    task: TaskLite;
    onChange: (next: AssigneeInput[]) => void; // emit final { nik, name }[]
    className?: string;
    disabled?: boolean;
};

// ===== Utils =====
const normNik = (v: unknown) => String(v ?? "").trim();
const initials = (n: string) => {
    if (!n) return "?";
    const p = n.trim().split(/\s+/);
    return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() || p[0]?.[0]?.toUpperCase() || "?";
};

// ✅ Terima undefined/null supaya aman saat TaskLite.assignees = null
function AvatarStack({ assignees }: { assignees?: AssigneeInput[] | null }) {
    const list = assignees ?? [];
    const top3 = list.slice(0, 3);
    const extra = Math.max(list.length - 3, 0);

    if (list.length === 0) {
        // Empty state: plus avatar menjadi trigger popover
        return (
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Tambah assignee"
                    className="cursor-pointer disabled:cursor-not-allowed"
                >
                    <Avatar
                        className="h-7 w-7 ring-2 ring-background bg-muted cursor-pointer"
                        title="Tambah assignee"
                    >
                        <AvatarFallback className="p-0 pointer-events-none">
                            <UserRoundPlus className="h-3.5 w-3.5 pointer-events-none" aria-hidden="true" />
                        </AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>

        );
    }

    return (
        <div className="flex items-center -space-x-2">
            {top3.map((a) => (
                <Avatar key={a.nik} className="h-7 w-7 ring-2 ring-background" title={a.name}>
                    {/* conditional avatar image */}
                    {/*{a?.avatarUrl ? <AvatarImage src={a.avatarUrl} alt={a.name} /> : null}*/}
                    {/* fallback initials tetap */}
                    <AvatarFallback className="text-[10px] font-semibold">
                        {initials(a?.name ?? '')}
                    </AvatarFallback>
                </Avatar>
            ))}

            {/* PLUS avatar sebagai trigger popover */}
            <PopoverTrigger asChild>
                <button type="button" aria-label="Tambah assignee">
                    <Avatar
                        className="h-7 w-7 ring-2 ring-background bg-muted cursor-pointer disabled:cursor-not-allowed"
                        title="Tambah assignee"
                    >
                        <AvatarFallback className="p-0">
                            <UserRoundPlus className="h-3.5 w-3.5" aria-hidden="true" />
                        </AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>

            {extra > 0 && (
                <Avatar className="h-7 w-7 ring-2 ring-background bg-muted" title={`+${extra} more`}>
                    <AvatarFallback className="text-[10px]">+{extra}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}

const AssigneePicker = memo(function AssigneePickerNikNama({
                                                               task,
                                                               onChange,
                                                               className,
                                                               disabled,
                                                           }: AssigneePickerNikNamaProps) {
    const { id: projectId } = useParams<{ id: string }>();
    const { data: project, isLoading, error } = useProjectDetailAction(projectId);

    const [open, setOpen] = useState(false);

    // 1) Ambil & dedupe members by nik ter-normalisasi
    const members = useMemo(() => {
        const arr = (project?.members ?? []) as MemberFromProject[];
        const map = new Map<string, MemberFromProject>();
        for (const m of arr) {
            const key = normNik(m.nik);
            if (!map.has(key)) map.set(key, { nik: key, nama: m.nama });
        }
        return Array.from(map.values());
    }, [project]);

    // 2) Local selection (nik) + sync dari server
    const seedAssignees = useMemo(
        () => (task.assignees ?? []) as AssigneeInput[],
        [task.assignees]
    );

    const [localSet, setLocalSet] = useState<Set<string>>(
        () => new Set(seedAssignees.map((a) => normNik(a.nik)))
    );

    useEffect(() => {
        const next = new Set(((task.assignees ?? []) as AssigneeInput[]).map((a) => normNik(a.nik)));
        setLocalSet(next);
    }, [task.assignees]);

    // 3) Derive groups
    const availableMembers = useMemo(
        () => members.filter((m) => !localSet.has(normNik(m.nik))),
        [members, localSet]
    );
    const assignedMembers = useMemo(
        () => members.filter((m) => localSet.has(normNik(m.nik))),
        [members, localSet]
    );

    // Map nama assignee saat ini, dimemo supaya stabil
    const currentNameMap = useMemo(
        () => new Map(seedAssignees.map((a) => [normNik(a.nik), String(a.name ?? "").trim()])),
        [seedAssignees]
    );

    // 4) Build payload — pastikan name selalu string non-empty
    const buildNext = useCallback(
        (set: Set<string>): AssigneeInput[] => {
            return Array.from(set).map((nik) => {
                const key = normNik(nik);
                const m = members.find((x) => normNik(x.nik) === key);
                const raw = m?.nama ?? currentNameMap.get(key) ?? "";
                const name = String(raw).trim() || "Unknown";
                return { nik: key, name };
            });
        },
        [members, currentNameMap]
    );

    // 5) Toggle
    const toggleMember = useCallback(
        (m: MemberFromProject) => {
            const nik = normNik(m.nik);
            setLocalSet((prev) => {
                const next = new Set(prev);
                if (next.has(nik)) next.delete(nik);
                else next.add(nik);
                onChange(buildNext(next)); // emit { nik, name }[]
                return next;
            });
        },
        [buildNext, onChange]
    );

    // ===== Render states =====
    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-16" />
            </div>
        );
    }
    if (error) {
        return <div className={cn("text-xs text-destructive", className)}>Failed to load members</div>;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {/* Container biasa; trigger ada di ikon “+” di dalam AvatarStack */}
            <div
                className={cn(
                    "h-7 inline-flex items-center gap-2 rounded border-none px-1.5 py-1.5",
                    disabled && "opacity-60",
                    className
                )}
            >
                {members?.length ? (
                    <AvatarStack assignees={task.assignees} />
                ) : (
                    // Jika belum ada daftar member project, tetap tampilkan plus trigger
                    <AvatarStack assignees={[]} />
                )}
            </div>

            <PopoverContent className="p-0 w-[320px]" align="start">
                <Command>
                    <div className="px-2 pt-2 pb-0">
                        <CommandInput placeholder="Search members…" className="h-9" />
                    </div>
                    <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
                        No members found.
                    </CommandEmpty>

                    <ScrollArea className="max-h-[300px]">
                        {/* Members (EXCLUDE assigned) */}
                        <CommandGroup heading="Members">
                            {availableMembers.map((m) => {
                                const mid = normNik(m.nik);
                                return (
                                    <CommandItem
                                        key={mid}
                                        value={m.nama}
                                        className="px-2"
                                        onSelect={() => toggleMember(m)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <Checkbox
                                                checked={false}
                                                onCheckedChange={() => toggleMember(m)}
                                                className="mr-1"
                                            />
                                            <Avatar className="size-7">
                                                <AvatarFallback>{initials(m.nama)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <span className="truncate text-sm font-medium leading-none">{m.nama}</span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>

                        {/* Assigned (for unassign) */}
                        {assignedMembers.length > 0 && (
                            <CommandGroup heading="Assigned">
                                {assignedMembers.map((m) => {
                                    const mid = normNik(m.nik);
                                    return (
                                        <CommandItem
                                            key={mid}
                                            value={m.nama}
                                            className="px-2"
                                            onSelect={() => toggleMember(m)}
                                        >
                                            <div className="flex items-center gap-3 w-full opacity-80">
                                                <Checkbox
                                                    checked
                                                    onCheckedChange={() => toggleMember(m)}
                                                    className="mr-1"
                                                />
                                                <Avatar className="size-7">
                                                    <AvatarFallback>{initials(m.nama)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <span className="truncate text-sm font-medium leading-none">{m.nama}</span>
                                                </div>
                                                <Check className="size-4 shrink-0" />
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    );
});

export default AssigneePicker;
