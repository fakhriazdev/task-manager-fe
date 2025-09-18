'use client';


import TicketForm from "@/app/shared/ticket/[storeId]/components/TicketForm";
export default function PageReport() {

    return (
     <div className="w-full bg-[#c7c7c7] dark:bg-primary pt-10">
         <TicketForm/>
         {/*<TicketTable/>*/}
     </div>
    );
}
