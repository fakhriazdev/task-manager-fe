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
import {
    AvatarList,
    initials,
    getPastelClassesForItem,
    normNik,
    type AvatarListItem
} from "@/components/ui/AvatarList";

export type Assignee = { nik: string; nama: string };

export type AssigneePickerNikNamaProps = {
    currentMembers: Assignee[] | null;
    members: Assignee[] | null;
    onChange: (next: Assignee[]) => void;
    className?: string;
    disabled?: boolean;
    hasAccess?: boolean;
};

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
        () => (members ?? []).filter((m) => !selectedSet.has(normNik(m.nik))),
        [members, selectedSet],
    );

    const assignedMembers = useMemo(
        () => (members ?? []).filter((m) => selectedSet.has(normNik(m.nik))),
        [members, selectedSet],
    );

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
                nextRaw = selected.filter((a) => normNik(a.nik) !== key);
            } else {
                const nama =
                    String(m.nama ?? currentNameMap.get(key) ?? "").trim() ||
                    "Unknown";
                nextRaw = [...selected, { nik: key, nama }];
            }

            const next = nextRaw.map((a) => ({
                nik: normNik(a.nik),
                nama: String(a.nama ?? "").trim() || "Unknown",
            }));

            onChange(next);
        },
        [interactive, selected, selectedSet, currentNameMap, onChange],
    );

    // 🔒 Read-only mode
    if (!interactive) {
        if (selected.length === 0) {
            return null;
        }

        return (
            <div
                className={cn(
                    "h-7 inline-flex items-center gap-2 rounded border-none px-1.5 py-1.5 opacity-60",
                    className,
                )}
            >
                <AvatarList items={selected} maxVisible={3} size="sm" />
            </div>
        );
    }

    // ✅ Interactive mode
    const plusTrigger = (
        <PopoverTrigger asChild>
            <button
                type="button"
                aria-label="Tambah assignee"
                className="cursor-pointer disabled:cursor-not-allowed"
            >
                <Avatar
                    className="h-7 w-7 ring-2 ring-background"
                    title="Tambah assignee"
                >
                    <AvatarFallback className="p-0 bg-muted">
                        <UserRoundPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    </AvatarFallback>
                </Avatar>
            </button>
        </PopoverTrigger>
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div
                className={cn(
                    "h-7 inline-flex items-center gap-2 rounded border-none px-1.5 py-1.5",
                    disabled && "opacity-60",
                    className,
                )}
            >
                {selected.length === 0 ? (
                    // Hanya plus button
                    plusTrigger
                ) : (
                    // Avatars + plus button
                    <AvatarList
                        items={selected}
                        maxVisible={3}
                        size="md"
                        renderTrigger={plusTrigger}
                    />
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
                        {/* Available Members */}
                        <CommandGroup heading="Members">
                            {availableMembers.map((m) => {
                                const mid = normNik(m.nik);
                                const pastel = getPastelClassesForItem(m as AvatarListItem);
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
                                            <Avatar className="size-7 border border-border ring-1 ring-background">
                                                <AvatarFallback
                                                    className={cn(
                                                        "text-[11px] font-medium uppercase",
                                                        pastel
                                                    )}
                                                >
                                                    {initials(m.nama)}
                                                </AvatarFallback>
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

                        {/* Assigned Members */}
                        {assignedMembers.length > 0 && (
                            <CommandGroup heading="Assigned">
                                {assignedMembers.map((m) => {
                                    const mid = normNik(m.nik);
                                    const pastel = getPastelClassesForItem(m as AvatarListItem);
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
                                                <Avatar className="size-7 border border-border ring-1 ring-background">
                                                    <AvatarFallback
                                                        className={cn(
                                                            "text-[11px] font-medium uppercase",
                                                            pastel
                                                        )}
                                                    >
                                                        {initials(m.nama)}
                                                    </AvatarFallback>
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