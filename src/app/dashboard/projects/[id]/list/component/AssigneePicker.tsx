"use client";

import * as React from "react";
import { memo, useCallback, useMemo, useState } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandEmpty,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, UserRoundPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Assignee = { nik: string; nama: string };

export type AssigneePickerNikNamaProps = {
    currentMembers: Assignee[] | null; // assignee yg nempel di task/subtask ini
    members: Assignee[] | null;        // daftar member project / task
    onChange: (next: Assignee[]) => void;
    className?: string;
    disabled?: boolean;
    hasAccess?: boolean;
};

// ===== Utils =====
const normNik = (v: unknown) => String(v ?? "").trim();

const initials = (n: string) => {
    if (!n) return "?";
    const p = n.trim().split(/\s+/);
    return (
        ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() ||
        p[0]?.[0]?.toUpperCase() ||
        "?"
    );
};

// ✅ AvatarStack: pure visual, bisa interaktif atau read-only
function AvatarStack({
                         assignees,
                         interactive = true,
                     }: {
    assignees?: Assignee[] | null;
    interactive?: boolean;
}) {
    const list = assignees ?? [];
    const top3 = list.slice(0, 3);
    const extra = Math.max(list.length - 3, 0);

    // Tidak ada assignee
    if (list.length === 0) {
        if (!interactive) {
            // 🔒 Read-only & no access → tidak render apapun
            return null;
        }

        // ✅ Interaktif: plus jadi trigger popover
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
                            <UserRoundPlus
                                className="h-3.5 w-3.5 pointer-events-none"
                                aria-hidden="true"
                            />
                        </AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>
        );
    }

    // Ada assignee tapi non-interaktif → read-only avatars, tanpa plus
    if (!interactive) {
        return (
            <div className="flex items-center -space-x-2">
                {top3.map((a) => (
                    <Avatar
                        key={normNik(a.nik)}
                        className="h-7 w-7 ring-2 ring-background"
                        title={a.nama}
                    >
                        <AvatarFallback className="text-[10px] font-semibold">
                            {initials(a?.nama ?? "")}
                        </AvatarFallback>
                    </Avatar>
                ))}
                {extra > 0 && (
                    <Avatar
                        className="h-7 w-7 ring-2 ring-background bg-muted"
                        title={`+${extra} more`}
                    >
                        <AvatarFallback className="text-[10px]">+{extra}</AvatarFallback>
                    </Avatar>
                )}
            </div>
        );
    }

    // Ada assignee & interaktif → avatars + plus trigger + extra badge
    return (
        <div className="flex items-center -space-x-2">
            {top3.map((a) => (
                <Avatar
                    key={normNik(a.nik)}
                    className="h-7 w-7 ring-2 ring-background"
                    title={a.nama}
                >
                    <AvatarFallback className="text-[10px] font-semibold">
                        {initials(a?.nama ?? "")}
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
                <Avatar
                    className="h-7 w-7 ring-2 ring-background bg-muted"
                    title={`+${extra} more`}
                >
                    <AvatarFallback className="text-[10px]">+{extra}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}

const AssigneePicker = memo(function AssigneePickerNikNama({
                                                               currentMembers,
                                                               members,
                                                               onChange,
                                                               className,
                                                               disabled,
                                                               hasAccess,
                                                           }: AssigneePickerNikNamaProps) {
    const [open, setOpen] = useState(false);
    const interactive = !!hasAccess && !disabled;

    // 🔹 selected selalu dinormalisasi (nik & nama)
    const selected = useMemo(
        () =>
            (currentMembers ?? []).map((a) => ({
                nik: normNik(a.nik),
                nama: String(a.nama ?? "").trim() || "Unknown",
            })),
        [currentMembers],
    );

    const selectedSet = useMemo(
        () => new Set(selected.map((a) => normNik(a.nik))),
        [selected],
    );

    const availableMembers = useMemo(
        () =>
            (members ?? []).filter((m) => !selectedSet.has(normNik(m.nik))),
        [members, selectedSet],
    );

    const assignedMembers = useMemo(
        () =>
            (members ?? []).filter((m) => selectedSet.has(normNik(m.nik))),
        [members, selectedSet],
    );

    // Map nama dari currentMembers (selected) buat jaga-jaga
    const currentNameMap = useMemo(
        () =>
            new Map(
                selected.map((a) => [
                    normNik(a.nik),
                    String(a.nama ?? "").trim(),
                ]),
            ),
        [selected],
    );

    const toggleMember = useCallback(
        (m: Assignee) => {
            if (!interactive) return;

            const key = normNik(m.nik);
            const exists = selectedSet.has(key);

            let nextRaw: Assignee[];
            if (exists) {
                // unassign
                nextRaw = selected.filter((a) => normNik(a.nik) !== key);
            } else {
                // assign
                const nama =
                    String(m.nama ?? currentNameMap.get(key) ?? "").trim() || "Unknown";
                nextRaw = [...selected, { nik: key, nama }];
            }

            // 🔐 GUARD: pastikan semua nik & nama sudah bersih sebelum dikirim keluar
            const next = nextRaw.map((a) => ({
                nik: normNik(a.nik),
                nama: String(a.nama ?? "").trim() || "Unknown",
            }));

            onChange(next);
        },
        [interactive, selected, selectedSet, currentNameMap, onChange],
    );

    // 🧠 Kalau tidak interactive (hasAccess === false atau disabled)
    if (!interactive) {
        const count = selected.length;

        if (count === 0) {
            // no access + no assignee → no render
            return null;
        }

        return (
            <div
                className={cn(
                    "h-7 inline-flex items-center gap-2 rounded border-none px-1.5 py-1.5 opacity-60",
                    className,
                )}
            >
                <AvatarStack assignees={selected} interactive={false} />
            </div>
        );
    }

    const avatarAssignees = selected;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div
                className={cn(
                    "h-7 inline-flex items-center gap-2 rounded border-none px-1.5 py-1.5",
                    disabled && "opacity-60",
                    className,
                )}
            >
                <AvatarStack assignees={avatarAssignees} interactive={true} />
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
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <Checkbox
                                                checked={false}
                                                onCheckedChange={() => toggleMember(m)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mr-1"
                                            />
                                            <Avatar className="size-7">
                                                <AvatarFallback>{initials(m.nama)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                        <span className="truncate text-sm font-medium leading-none">
                          {m.nama}
                        </span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>

                        {/* Assigned */}
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
                                                    className="mr-1 pointer-events-none"
                                                    aria-hidden="true"
                                                />
                                                <Avatar className="size-7">
                                                    <AvatarFallback>{initials(m.nama)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                          <span className="truncate text-sm font-medium leading-none">
                            {m.nama}
                          </span>
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
