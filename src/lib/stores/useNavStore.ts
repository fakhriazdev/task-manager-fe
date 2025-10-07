import { create } from "zustand"

export type NavDialogType = "projects" | "icikiwir"

interface NavState {
    open: NavDialogType | null
    setOpen: (dialog: NavDialogType | null) => void
    openDialog: (dialog: NavDialogType) => void
    closeDialog: () => void
}

export const useNavStore = create<NavState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    openDialog: (dialog) => set({ open: dialog }),
    closeDialog: () => set({ open: null }),
}))
