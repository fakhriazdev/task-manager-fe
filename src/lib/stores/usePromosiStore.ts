import { create } from 'zustand';
import { Promosi } from "@/app/dashboard/promosi/schemas/schemas";

type PromosiDialogType = 'create' | 'update' | 'import' | 'preview';

interface RolesState {
    open: PromosiDialogType | null;
    setOpen: (dialog: PromosiDialogType | null) => void;
    currentRow: Promosi | null;
    setCurrentRow: (promosi: Promosi | null) => void;
}

export const usePromosiStore = create<RolesState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    currentRow: null,
    setCurrentRow: (promosi) => set({ currentRow: promosi }),
}));
