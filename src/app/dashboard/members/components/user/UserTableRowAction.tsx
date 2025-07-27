"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserSchema} from "@/app/dashboard/members/schemas/schemas"
import { Row } from "@tanstack/table-core"
import { MoreVertical } from "lucide-react"
import {useUserStore} from "@/lib/stores/useUserStore";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export default function DataTableRowAction<TData>({row,}: DataTableRowActionsProps<TData>) {
    const { setOpen, setCurrentRow } = useUserStore()
    const parsed = UserSchema.safeParse(row.original)
    console.log(parsed)
    if (!parsed.success) return null
    const user = parsed.data



    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] z-50">
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(user)
                        setOpen("update")
                    }}
                >
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(user)
                        setOpen("reset")
                    }}
                >
                    Reset Password
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
