import { useTicketActions, useTicketByNikActions } from "@/lib/ticket/useTicketAction";
import { ticketColumns } from "@/app/dashboard/ticket/components/TicketColumns";
import TicketDialogs from "@/app/dashboard/ticket/components/TicketDialogs";
import { DataTableTicket } from "@/app/dashboard/ticket/components/DataTableTicket";
import TabSkeleton from "@/app/dashboard/ticket/TabSkeleton";

interface TicketTableProps {
    nik?: string;
}

export default function TicketTable({ nik }: TicketTableProps) {
    // query by nik, hanya jalan kalau nik ada
    const { data: ticketsByNik, isLoading: isLoadingByNik } = useTicketByNikActions(nik ?? "");

    // query all ticket, hanya jalan kalau nik gak ada
    const { data: allTickets, isLoading: isLoadingAll } = useTicketActions();

    const ticketData = nik ? ticketsByNik : allTickets;
    const isLoading = nik ? isLoadingByNik : isLoadingAll;

    return (
        <div className="flex flex-col gap-4">
            {isLoading ? (
                <TabSkeleton />
            ) : (
                <DataTableTicket columns={ticketColumns} data={ticketData ?? []} />
            )}
            <TicketDialogs />
        </div>
    );
}
