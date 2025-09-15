"use client"

import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Row} from "@tanstack/table-core"
import {MoreVertical} from "lucide-react"
import {useTicketStore} from "@/lib/stores/useTicketStore"
import {EStatus, TicketList} from "@/lib/ticket/TicketTypes"

interface DataTableRowActionsProps {
    row: Row<TicketList>
}

export default function DataTableRowAction({ row }: DataTableRowActionsProps) {
    const { setOpen, setCurrentRow } = useTicketStore()
    const ticket = row.original

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
                >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[160px] z-50">
                {/* Selalu ada */}
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(ticket)
                        setOpen("detail")
                        console.log("Row diset:", ticket)
                    }}
                >
                    Detail
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={ticket.status === EStatus.ONPROCESS || ticket.status === EStatus.COMPLETED}
                    onClick={() => {
                        if (ticket.status === EStatus.ONPROCESS || ticket.status === EStatus.COMPLETED) return
                        setCurrentRow(ticket)
                        setOpen("complete")
                    }}
                >
                    Complite
                </DropdownMenuItem>
                {/* Muncul hanya kalau category Transaksi */}
                {ticket.category?.toLowerCase().trim() === "transaksi" && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={ticket.status === EStatus.ONPROCESS || ticket.status === EStatus.COMPLETED}
                            onClick={() => {
                                if (ticket.status === EStatus.ONPROCESS || ticket.status === EStatus.COMPLETED) return
                                setCurrentRow(ticket)
                                setOpen("confirm")
                            }}
                        >
                            Send Message
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
