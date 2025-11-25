"use client";

import {
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/project/table-project";

export function TaskTableHead() {
    return (
        <TableHeader>
            <TableRow className="bg-card">
                {/* Nama - colspan 2 (45% total) */}
                <TableHead
                    colSpan={2}
                    className="py-2 px-3 text-start font-medium tracking-wide"
                >
                    Nama
                </TableHead>

                {/* Assignee (18%) */}
                <TableHead
                    className="py-2 px-3 text-start font-medium tracking-wide"
                >
                    Assignee
                </TableHead>

                {/* Tenggat (18%) */}
                <TableHead
                    className="py-2 px-3 text-start font-medium tracking-wide"
                >
                    Tenggat
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}