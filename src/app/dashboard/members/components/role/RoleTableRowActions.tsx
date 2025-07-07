"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRolesStore } from "@/lib/stores/useRolesStore"
import { roleSchema } from "@/app/dashboard/members/data/schemas"
import { Row } from "@tanstack/table-core"
import { MoreVertical } from "lucide-react" // opsional

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export default function DataTableRowAction<TData>({row,}: DataTableRowActionsProps<TData>) {
    const { setOpen, setCurrentRow, open, currentRow } = useRolesStore()
    const parsed = roleSchema.safeParse(row.original)
    if (!parsed.success) return null
    const role = parsed.data


    console.log(open, currentRow)

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
                        setCurrentRow(role)
                        setOpen("update")
                    }}
                >
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(role)
                        setOpen("delete")
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
