import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import * as React from "react";

import {Role} from "@/app/dashboard/members/data/schemas";
import DataTableRowAction from "./RoleTableRowActions";

export const roleColumns: ColumnDef<Role>[] = [
    {
        accessorKey: "id",
        header: () => <div className="w-[20px]">ID</div>,
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
                    {row.original.nama}
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