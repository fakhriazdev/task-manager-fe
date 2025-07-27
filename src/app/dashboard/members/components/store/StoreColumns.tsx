import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import * as React from "react";
import {Store} from "@/app/dashboard/members/schemas/schemas";
import DataTableRowAction from "@/app/dashboard/members/components/store/StoreTableRowAction";



export const storeColumns: ColumnDef<Store>[] = [
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
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => (
            <div>
                <div className="text-primary text-sm px-1.5">
                    {row.original.brand}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "regionId",
        header: "Region",
        cell: ({ row }) => (
            <div>
                <div className="text-primary text-sm px-1.5">
                    {row.original.regionId}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <div>
                <div className="text-primary text-sm px-1.5">
                    {row.original.address}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "statusActive",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.statusActive;
            const isActive = status;

            return (
                <Badge
                    variant="outline"
                    className={isActive ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}
                >
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
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