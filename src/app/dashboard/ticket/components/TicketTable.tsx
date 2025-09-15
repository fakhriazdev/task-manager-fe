import { DataTable } from "@/components/shared/dataTable";
import { useTicketActions } from "@/lib/ticket/useTicketAction";

import {ticketColumns} from "@/app/dashboard/ticket/components/TicketColumns";
import TicketDialogs from "./TicketDialogs";

export default function TicketTable() {
    const { data: ticketData } = useTicketActions();
    console.log(ticketData)
   return (
       <>
           <DataTable columns={ticketColumns} data={ticketData ?? []} />
           <TicketDialogs />
       </>

   )
}