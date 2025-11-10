'use client';

import * as React from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useProjectStore } from '@/lib/stores/useProjectStore';

type Props = {
    projectId?: string;        // opsional, tidak dipakai di CTA ini
    colSpan?: number;          // default 3, samakan dengan kolom tabel
    disabled?: boolean;        // mis. saat dragging
};

export default function AddSection({colSpan = 4, disabled,}: Props) {
    const setOpen = useProjectStore((s) => s.setOpen);
    const setCurrentRow = useProjectStore((s) => s.setCurrentRow);

    return (
        <TableBody>
            <TableRow className="border-t border-border/50 bg-card">
                <TableCell colSpan={colSpan} className="p-0">
                    <button
                        type="button"
                        className="text-left px-4 py-3 hover:bg-muted/40 transition flex items-center gap-2 disabled:opacity-50"
                        disabled={!!disabled}
                        aria-label="Tambahkan bagan"
                        onClick={() => {
                            setCurrentRow(null);
                            setOpen('createSection');
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Tambahkan Bagan</span>
                    </button>
                </TableCell>
            </TableRow>
        </TableBody>
    );
}
