import { create } from 'zustand';
import { User } from "@/app/dashboard/members/data/schemas";

type UserDialogType = 'create' | 'update' | 'delete' | 'import';

interface UserState {
    open: UserDialogType | null;
    setOpen: (dialog: UserDialogType | null) => void;
    currentRow: User | null;
    setCurrentRow: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    currentRow: null,
    setCurrentRow: (user) => set({ currentRow: user }),
}));
