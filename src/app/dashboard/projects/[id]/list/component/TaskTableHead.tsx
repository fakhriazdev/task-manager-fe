// TaskTableHead.tsx
"use client";

import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { COLS_GRID, COL_SEP, ROW_HSEP, hdrBase } from "../types/TaskTable.const";

export function TaskTableCols() {
    // Boleh dibuang kalau seluruh layout sudah murni grid.
    return null;
}

export function TaskTableHead() {
    return (
        <TableHeader>
            <TableRow className={ROW_HSEP}>
                <TableHead colSpan={3} className="p-0 top-0 bg-muted/40">
                    <div className={`${COLS_GRID} ${COL_SEP} ${ROW_HSEP} ${hdrBase}`}>
                        <div className="py-2 px-3">Nama</div>
                        <div className="py-2 px-3 text-center">Assignee</div>
                        <div className="py-2 px-3 text-center">Creator</div>
                    </div>
                </TableHead>
            </TableRow>
        </TableHeader>

    );
}
