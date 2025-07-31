"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { promosiSchema} from "@/app/dashboard/promosi/schemas/schemas"
import { Row } from "@tanstack/table-core"
import { MoreVertical } from "lucide-react"
import {usePromosiStore} from "@/lib/stores/usePromosiStore";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export default function PromosiTableRowActions<TData>({row,}: DataTableRowActionsProps<TData>) {
    const { setOpen, setCurrentRow } = usePromosiStore()

    const parsed = promosiSchema.safeParse(row.original)
    console.log(parsed)
    if (!parsed.success) return null
    const promosi = parsed.data



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
                        setCurrentRow(promosi)
                        setOpen("update")
                    }}
                >
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/*<DropdownMenuItem*/}
                {/*    onClick={() => {*/}
                {/*        setCurrentRow(promosi)*/}
                {/*        setOpen("reset")*/}
                {/*    }}*/}
                {/*>*/}
                {/*    */}
                {/*</DropdownMenuItem>*/}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
