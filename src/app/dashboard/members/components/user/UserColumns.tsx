import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import * as React from "react";

import DataTableRowAction from "@/app/dashboard/members/components/user/UserTableRowAction";
import {AccessRegions, AccessStores, User} from "@/lib/user/userType";

export const userColumns: ColumnDef<User>[] = [
    {
        accessorKey: "nik",
        header: () => <div className="w-24">NIK</div>,
        cell: ({ row }) => (
            <div className="">
                <Badge variant="outline" className="text-primary font-semibold text-xs">
                    {row.original.nik}
                </Badge>
            </div>
        ),
        enableHiding: false,
    },
    {
        accessorKey: "nama",
        header: "Nama",
        cell: ({ row }) => (
            <div className="text-start text-primary text-sm">
                {row.original.nama}
            </div>
        ),
    },
    {
        accessorKey: "noTelp",
        header: "No Telephone",
        cell: ({ row }) => (
            <div className="text-start text-primary text-sm">
                {row.original.noTelp}
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="text-start text-primary text-sm">
                {row.original.email}
            </div>
        ),
    },
    {
        accessorKey: "roleId",
        header: "Role",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-primary font-semibold text-xs">
                {row.original.roleId}
            </Badge>
        ),
    },
    {
        accessorKey: "handleWeb",
        header: "Handle Web",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-primary font-semibold text-xs">
                {!row.original.handleWeb ? 'NO' : "YES"}
            </Badge>
        ),
    },
    {
        accessorKey: "accessStores",
        header: "Access Stores",
        cell: ({ row }) => {
            const stores = row.original.accessStoreIds || [];
            const role = row.original.roleId;

            return (
                <div className="flex justify-center items-center h-full">
                    {role === "SUPER" ? (
                        <Badge variant="outline">ALL</Badge>
                    ) : stores.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                            {stores.map((item: AccessStores) => (
                                <Badge key={item.storeId} variant="outline">
                                    {item.storeId}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "accessRegions",
        header: "Access Regions",
        cell: ({ row }) => {
            const regions = row.original.accessRegionIds || [];
            const role = row.original.roleId;

            return (
                <div className="flex justify-center items-center h-full">
                    {role === "SUPER" ? (
                        <Badge variant="outline">ALL</Badge>
                    ) : regions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                            {regions.map((item: AccessRegions) => (
                                <Badge key={item.regionId} variant="outline">
                                    {item.regionId}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "statusActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.statusActive;

            return (
                <Badge
                    variant="outline"
                    className={
                        isActive
                            ? "border-green-500 text-green-600"
                            : "border-red-500 text-red-600"
                    }
                >
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: () => (
            <div className="text-right w-full pr-2">Actions</div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-end pr-2">
                <DataTableRowAction row={row} />
            </div>
        ),
    },
];
