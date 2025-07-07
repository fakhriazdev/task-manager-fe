import { create } from 'zustand';
import { Role } from "@/app/dashboard/members/data/schemas";

type RolesDialogType = 'create' | 'update' | 'delete' | 'import';

interface RolesState {
    open: RolesDialogType | null;
    setOpen: (dialog: RolesDialogType | null) => void;
    currentRow: Role | null;
    setCurrentRow: (role: Role | null) => void;
}

export const useRolesStore = create<RolesState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    currentRow: null,
    setCurrentRow: (role) => set({ currentRow: role }),
}));
