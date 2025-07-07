import { create } from 'zustand';
import { Region } from "@/app/dashboard/members/data/schemas";

type RegionDialogType = 'create' | 'update' | 'delete' | 'import';

interface RegionState {
    open: RegionDialogType | null;
    setOpen: (dialog: RegionDialogType | null) => void;
    currentRow: Region | null;
    setCurrentRow: (region: Region | null) => void;
}

export const useRegionStore = create<RegionState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    currentRow: null,
    setCurrentRow: (region) => set({ currentRow: region }),
}));
