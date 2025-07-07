import { create } from 'zustand';
import { Store } from "@/app/dashboard/members/data/schemas";

type StoreDialogType = 'create' | 'update' | 'delete' | 'import';

interface StoreState {
    open: StoreDialogType | null;
    setOpen: (dialog: StoreDialogType | null) => void;
    currentRow: Store | null;
    setCurrentRow: (store: Store | null) => void;
}

export const useStoreStore = create<StoreState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    currentRow: null,
    setCurrentRow: (store) => set({ currentRow: store }),
}));
