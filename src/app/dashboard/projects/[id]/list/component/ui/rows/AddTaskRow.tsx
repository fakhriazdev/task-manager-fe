'use client';

import * as React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useProjectStore } from '@/lib/stores/useProjectStore';

type Props = {
    colSpan?: number;
    sectionId: string;
    disabled?: boolean;
};

export default function AddTaskRow({ colSpan = 5, sectionId, disabled }: Props) {
    const setOpen = useProjectStore((s) => s.setOpen);
    const setCurrentRow = useProjectStore((s) => s.setCurrentRow);

    return (
        <TableRow className="bg-transparent">
            <TableCell colSpan={colSpan} className="p-0">
                <button
                    type="button"
                    className="w-full h-11 text-sm text-muted-foreground hover:text-bg-muted/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={!!disabled}
                    onClick={() => {
                        setCurrentRow(sectionId);   // section target untuk createTask
                        setOpen('createTask');      // buka dialog global
                    }}
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambahkan task</span>
                </button>
            </TableCell>
        </TableRow>
    );
}
