import { useMemo, useDeferredValue, useState } from "react";
import { useTicketActions, useTicketByNikActions } from "@/lib/ticket/useTicketAction";
import { ticketColumns } from "@/app/dashboard/ticket/components/TicketColumns";
import TicketDialogs from "@/app/dashboard/ticket/components/TicketDialogs";
import { DataTableTicket } from "@/app/dashboard/ticket/components/DataTableTicket";
import TabSkeleton from "@/app/dashboard/ticket/TabSkeleton";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { TicketList } from "@/lib/ticket/TicketTypes";

interface TicketTableProps {
    nik?: string;
}

export default function TicketTable({ nik }: TicketTableProps) {
    // 🔎 Query yang datang dari DataTableTicket (toolbar)
    const [globalQ, setGlobalQ] = useState<string>("");

    const isGlobalSearch = !!globalQ.trim();

    // fetch all tickets (dibutuhkan untuk pencarian lintas handler)
    const { data: allTickets, isLoading: isLoadingAll } = useTicketActions();

    // fetch by nik (hanya bila bukan global search dan nik ada)
    const { data: ticketsByNik, isLoading: isLoadingByNik } = useTicketByNikActions(
        !isGlobalSearch && nik ? nik : ""
    );

    const isLoading = isGlobalSearch ? isLoadingAll : nik ? isLoadingByNik : isLoadingAll;

    // smooth typing pada UI
    const deferredQ = useDeferredValue(globalQ);

    // filter global (tanpa any)
    const filteredAll: TicketList[] = useMemo(() => {
        if (!isGlobalSearch) return (allTickets ?? []) as TicketList[];
        const src = (allTickets ?? []) as TicketList[];
        const qLower = (deferredQ ?? "").toLowerCase().trim();
        if (!qLower) return src;
        const tokens = qLower.split(/\s+/).filter(Boolean);
        return src.filter((t: TicketList) => {
            const blob = JSON.stringify(t).toLowerCase();
            return tokens.every((tk) => blob.includes(tk));
        });
    }, [isGlobalSearch, allTickets, deferredQ]);

    // final data
    const ticketData: TicketList[] = isGlobalSearch
        ? filteredAll
        : nik
            ? ((ticketsByNik ?? []) as TicketList[])
            : ((allTickets ?? []) as TicketList[]);

    const { user } = useAuthStore();
    const enableHandler = user?.roleId === "SUPER";
    const columns = useMemo(() => ticketColumns({ enableHandler }), [enableHandler]);

    return (
        <div className="flex flex-col gap-4">
            {isLoading ? (
                <TabSkeleton />
            ) : (
                <DataTableTicket<TicketList>
                    columns={columns}
                    data={ticketData}
                    onGlobalQueryChange={setGlobalQ}
                    defaultGlobalQuery={globalQ}
                />
            )}
            <TicketDialogs />
        </div>
    );
}
