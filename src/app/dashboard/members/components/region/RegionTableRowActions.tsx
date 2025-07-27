"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {regionSchema} from "@/app/dashboard/members/schemas/schemas"
import { Row } from "@tanstack/table-core"
import { MoreVertical } from "lucide-react"
import {useRegionStore} from "@/lib/stores/useRegionStore";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export default function DataTableRowAction<TData>({row,}: DataTableRowActionsProps<TData>) {
    const { setOpen, setCurrentRow } = useRegionStore()
    const parsed = regionSchema.safeParse(row.original)
    if (!parsed.success) return null
    const region = parsed.data

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
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(region)
                        setOpen("update")
                    }}
                >
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(region)
                        setOpen("delete")
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
