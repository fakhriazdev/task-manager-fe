"use client";

import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export function TaskTableHead() {
    return (
        <TableHeader className="sticky top-0 z-20 bg-accent border-y border-foreground/15">
            <TableRow className="divide-x divide-foreground/15">
                <TableHead
                    colSpan={2}
                    className="py-2 px-3 text-center font-semibold"
                >
                    Nama
                </TableHead>
                <TableHead className="py-2 px-3 text-center font-semibold">
                    Assignee
                </TableHead>
                <TableHead className="py-2 px-3 text-center font-semibold">
                    Tenggat
                </TableHead>
                <TableHead className="py-2 px-3 text-center font-semibold">
                    Creator
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}
