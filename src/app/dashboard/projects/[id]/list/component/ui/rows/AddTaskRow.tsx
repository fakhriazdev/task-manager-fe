'use client';

import * as React from 'react';
import { TableRow, TableCell } from '@/components/ui/project/table-project';
import { Plus } from 'lucide-react';
import { useProjectStore } from '@/lib/stores/useProjectStore';

type Props = {
    colSpan?: number;
    sectionId: string;
    disabled?: boolean;
};

export default function AddTaskRow({ colSpan = 4, sectionId, disabled }: Props) {
    const setOpen = useProjectStore((s) => s.setOpen);
    const setCurrentRow = useProjectStore((s) => s.setCurrentRow);

    return (
        <TableRow className="bg-transparent">
            <TableCell colSpan={colSpan}>
                <button
                    type="button"
                    className=" pl-13.5 w-full h-7 text-sm text-muted-foreground/80 hover:text-bg-muted/40 transition flex items-center justify-start gap-2 disabled:opacity-50"
                    disabled={!!disabled}
                    onClick={() => {
                        setCurrentRow(sectionId);
                        setOpen('createTask');
                    }}
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambahkan task</span>
                </button>
            </TableCell>
        </TableRow>
    );
}
