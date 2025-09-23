"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Hook fetch user
import { useSummaryTicketByUser } from "@/lib/ticket/useTicketAction";

// Mutasi reassign
import { useReassignTicket } from "@/lib/ticket/useTicketAction";

// ConfirmDialog (import dari komponenmu)
import { ConfirmDialog } from "@/components/shared/confirmDialog";

// ==== Types ====
export type SummaryTicketByUser = { nik: string; name: string };
export type Person = { nik: string; nama: string };

type HandlerPickerProps = {
    ticketId: string;
    value?: Person | null;
    placeholder?: string;

};

export function HandlerPicker({
                                  ticketId,
                                  value,
                                  placeholder = "Pilih handler…",
                              }: HandlerPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");

    const { data: users = [], isLoading } = useSummaryTicketByUser();
    const { mutateAsync, isPending } = useReassignTicket();

    // map API -> Person
    const persons: Person[] = React.useMemo(
        () => users.map((u) => ({ nik: u.nik, nama: u.name })),
        [users]
    );

    // filter client-side
    const filtered = React.useMemo(() => {
        if (!query) return persons;
        const q = query.toLowerCase();
        return persons.filter(
            (u) => u.nama.toLowerCase().includes(q) || u.nik.toLowerCase().includes(q)
        );
    }, [persons, query]);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [pending, setPending] = React.useState<Person | null>(null);
    const [loadingConfirm, setLoadingConfirm] = React.useState(false);

    function requestSelect(p: Person) {
        if (value?.nik && value.nik === p.nik) {
            setOpen(false);
            return;
        }
        setPending(p);
        setOpen(false);
        setConfirmOpen(true);
    }

    async function handleConfirm() {
        if (!pending) return;
        try {
            setLoadingConfirm(true);
            await mutateAsync({ ticketId, nik: pending.nik });
            setConfirmOpen(false);
        } finally {
            setLoadingConfirm(false);
        }
    }

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-8"
                        disabled={isPending}
                    >
                        {value ? (
                            <SelectedChip person={value} />
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0 w-[320px] border" align="start">
                    <Command shouldFilter={false} className="bg-popover">
                        <div className="px-2 pt-2">
                            <CommandInput
                                value={query}
                                onValueChange={setQuery}
                                placeholder="Cari nama atau NIK…"
                                className="h-9"
                                aria-label="Cari handler"
                            />
                        </div>

                        <CommandList>
                            <CommandEmpty>{isLoading ? "Loading..." : "Tidak ada hasil"}</CommandEmpty>

                            <CommandGroup heading="Pengguna">
                                <ScrollArea className="max-h-60">
                                    {filtered.map((p) => {
                                        const disabled = !!value?.nik && value.nik === p.nik;
                                        return (
                                            <CommandItem
                                                key={p.nik}
                                                value={p.nik}
                                                onSelect={() => requestSelect(p)}
                                                disabled={disabled || isPending}
                                                className="rounded-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                            >
                                                <PersonRow person={p} />
                                                {disabled && (
                                                    <Check className="ml-auto h-4 w-4 text-muted-foreground" />
                                                )}
                                            </CommandItem>
                                        );
                                    })}
                                </ScrollArea>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Konfirmasi Perubahan Handler"
                desc={
                    <div className="space-y-1">
                        <div>
                            Apakah Anda yakin ingin mengubah handler untuk tiket <b>{ticketId}</b>{" "}
                            {value ? (
                                <>
                                    dari <b>{value.nama}</b> menjadi <b>{pending?.nama}</b>?
                                </>
                            ) : (
                                <>
                                    menjadi <b>{pending?.nama}</b>?
                                </>
                            )}
                        </div>
                        {pending && (
                            <div className="text-xs text-muted-foreground">NIK: {pending.nik}</div>
                        )}
                    </div>
                }
                confirmText="Ya, Simpan"
                cancelBtnText="Batal"
                handleConfirm={handleConfirm}
                isLoading={loadingConfirm || isPending}
            />
        </>
    );
}

// Sub Components
function SelectedChip({ person }: { person: Person }) {
    return <span className="truncate">{person.nama}</span>;
}

function PersonRow({ person }: { person: Person }) {
    return (
        <div className="flex items-center gap-3 w-full">
            <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{person.nama}</span>
                <span className="truncate text-xs text-muted-foreground">{person.nik}</span>
            </div>
        </div>
    );
}
