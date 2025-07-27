import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import * as React from "react";

import {Region} from "@/app/dashboard/members/schemas/schemas";
import DataTableRowAction from "@/app/dashboard/members/components/region/RegionTableRowActions";


export const regionColumns: ColumnDef<Region>[] = [
    {
        accessorKey: "id",
        header: () => <div className="w-[20px]">Code</div>,
        cell: ({ row }) => {
            return <div className="w-40">
                <Badge variant={"outline"} className="text-primary font-semibold text-sm px-1.5">
                    {row.original.id}
                </Badge>
            </div>
        },
        enableHiding: false,
    },
    {
        accessorKey: "nama",
        header: "Nama",
        cell: ({ row }) => (
            <div>
                <div className="text-primary text-sm px-1.5">
                    {row.original.region}
                </div>
            </div>
        ),
    },
    {
        id: 'actions',
        header: () => (
            <div className="text-right w-full pr-2">Actions</div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-end pr-2">
                <DataTableRowAction row={row} />
            </div>
        )
    },
]