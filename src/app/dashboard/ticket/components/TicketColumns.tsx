import {ColumnDef, FilterFn} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import * as React from "react"
import { EStatus, TicketList } from "@/lib/ticket/TicketTypes"
import Link from "next/link"
import { Check, Clock,BadgeAlert ,ArrowUpDown} from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import DataTableRowAction from "@/app/dashboard/ticket/components/TicketTableRowActions";
import {HandlerPicker} from "@/app/dashboard/ticket/components/HandlerPicker";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {Row} from "@tanstack/table-core";

// ---- Date range filter ----
type DateRange = { from?: string | Date | null; to?: string | Date | null }


export const dateRangeFilter: FilterFn<TicketList> = (row, columnId, value) => {
    const range = value as DateRange
    if (!range || (!range.from && !range.to)) return true

    const raw = row.getValue(columnId) as string | Date | undefined
    if (!raw) return false

    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return false

    const from = range.from ? new Date(range.from) : null
    const to = range.to ? new Date(range.to) : null

    const toInclusive =
        to && !Number.isNaN(to.getTime())
            ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
            : null

    if (from && d < from) return false
    if (toInclusive && d > toInclusive) return false
    return true
}

export const multiSelectFilter: FilterFn<TicketList> = (row, columnId, filterValue) => {
    const values = (filterValue as string[]) ?? []
    if (values.length === 0) return true
    const v = row.getValue(columnId)
    return values.includes(String(v))
}

const dateSortingFn = (
    rowA: Row<TicketList>,
    rowB: Row<TicketList>,
    columnId: string
) => {
    const a = rowA.getValue(columnId)
    const b = rowB.getValue(columnId)

    const ta = a ? new Date(a as string).getTime() : 0
    const tb = b ? new Date(b as string).getTime() : 0

    return ta - tb
}

export function ticketColumns({ enableHandler }: { enableHandler: boolean }): ColumnDef<TicketList>[] {
    return [
        {
            accessorKey: "id",
            header: () => <div className="min-w-24">Ticket ID</div>,
            enableColumnFilter: true,
            cell: ({row}) => (
                <Badge variant="outline" className="text-primary font-semibold text-xs">
                    {row.original.id}
                </Badge>
            ),
        },
        {
            accessorKey: "idStore",
            header: () => <div className="min-w-24">Store ID</div>,
            enableColumnFilter: true,
            cell: ({row}) => (
                <div className="text-start text-primary text-sm">
                    {row.original.idStore}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <div className="flex w-full justify-between">
                    <div>
                        Created At
                    </div>
                    <button
                        className="inline-flex items-center gap-1 font-medium hover:opacity-80"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        title="Sort by Created At"
                    >
                        <ArrowUpDown className="h-4 w-4" />
                    </button>
                </div>
            ),
            filterFn: dateRangeFilter,
            sortingFn: dateSortingFn,
            enableSorting: true,
            cell: ({row}) => (
                <div className="text-start text-primary text-sm">
                    {formatDateTime(row.original.createdAt)}
                </div>
            ),
        },
        {
            accessorKey: "noTelp",
            header: () => <div className="min-w-32">No.Telp</div>,
            cell: ({row}) => {
                const noTelp = row.original.noTelp
                const message = `Hai, kami tim *IT AMS* ingin menindak lanjuti tiket *${row.original.id}*. Boleh minta informasi tambahan terkait detail tiket tersebut?`
                const encodedMessage = encodeURIComponent(message)
                const waNumber = noTelp.replace(/^0/, "62")
                return (
                    <Link
                        href={`https://wa.me/${waNumber}?text=${encodedMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-start text-primary text-sm underline"
                    >
                        {noTelp}
                    </Link>
                )
            },
        },
        {
            accessorKey: "category",
            header: () => <div className="min-w-28">Category</div>,
            cell: ({row}) => (
                <div className="text-start text-primary text-sm">
                    {row.original.category}
                </div>
            ),
        },
        {
            accessorKey: "handler",
            header: () => <div className="min-w-28">Handler</div>,
            accessorFn: (row) => row.handler?.nama ?? "",
            cell: ({ row }) => {
                const current = { nik: row.original.handler.nik, nama: row.original.handler.nama }

                const isReadonly:boolean = !enableHandler || row.original.status === "COMPLETED";
                if (isReadonly) {
                    return (
                        <div className="text-primary font-semibold text-sm">
                            {row.original.handler?.nama ?? "-"}
                        </div>
                    );
                }

                return (
                    <HandlerPicker
                        ticketId={row.original.id}
                        value={current}
                    />
                );
            },
        },
        {
            accessorKey: "idtv",
            header: () => <div className="min-w-28">ID Team Viewer</div>,
            cell: ({ row }) => (
                <div className="text-primary font-semibold text-sm">
                    {row.original.idtv ?? "-"}
                </div>
            ),
        },



        {
            accessorKey: "completedBy",
            header: () => <div className="min-w-32">Completed By</div>,
            cell: ({row}) => (
                <div className="text-primary font-semibold text-sm">
                    {row.original.completedBy?.nama ?? "-"}
                </div>
            ),
        },
        {
            accessorKey: "completedAt",
            header: () => <div className="min-w-40">Completed At</div>,
            cell: ({row}) => {
                const completedAt = row.original?.completedAt
                return (
                    <Badge variant="outline" className="text-primary font-semibold text-xs">
                        {completedAt ? formatDateTime(completedAt) : "-"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "status",
            header: () => <div className="min-w-28">Status</div>,
            filterFn: multiSelectFilter,
            cell: ({row}) => {
                const status = row.original.status as EStatus
                let label = ""
                let style = ""
                let icon = null

                switch (status) {
                    case EStatus.COMPLETED:
                        label = "Completed"
                        style = "text-green-600 border-green-600 bg-green-50"
                        icon = <Check className="h-3 w-3"/>
                        break
                    case EStatus.ONPROCESS:
                        label = "On Process"
                        style = "text-yellow-600 border-yellow-600 bg-yellow-50"
                        icon = <Clock className="h-3 w-3"/>
                        break
                    case EStatus.QUEUED:
                        label = "Queued"
                        style = "text-blue-600 border-blue-600 bg-blue-50"
                        icon = <Clock className="h-3 w-3"/>
                        break
                    case EStatus.PENDING:
                        label = "Pending"
                        style = "text-yellow-600 border-yellow-600 bg-yellow-50"
                        icon = <BadgeAlert className="h-3 w-3"/>

                        break
                    case EStatus.FAILED:
                        label = "Failed"
                        style = "text-red-600 border-red-600 bg-red-50"
                        icon = <Clock className="h-3 w-3"/>
                        break
                    default:
                        label = status
                        style = "text-gray-600 border-gray-600 bg-gray-50"
                        icon = <Clock className="h-3 w-3"/>
                        break
                }

                return (
                    <Badge
                        variant="outline"
                        className={`flex items-center gap-1 font-semibold text-xs ${style}`}
                    >
                        {icon}
                        {label}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "reason",
            header: () => <div className="min-w-40">Reason</div>, // ⬅️ perbaiki label
            cell: ({ row }) => {
                const reason = row.original?.reason
                return reason ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span className="text-primary font-semibold text-xs cursor-default line-clamp-1">
                  {reason}
                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="whitespace-pre-wrap">{reason}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                )
            },
        },
        {
            id: "actions",
            header: () => (
                <div className="text-right w-full pr-2">Actions</div>
            ),
            cell: ({row}) => (
                <div className="flex justify-end pr-2">
                    <DataTableRowAction row={row}/>
                </div>
            ),
        },
    ];
}
