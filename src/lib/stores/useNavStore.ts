import { create } from "zustand"
import {Project} from "@/lib/project/projectTypes";

export type NavDialogType = "project" | "editProject";

interface NavState {
    open: NavDialogType | null
    setOpen: (dialog: NavDialogType | null) => void
    openDialog: (dialog: NavDialogType) => void
    closeDialog: () => void

    // project
    currentProject: Project | null
    setCurrentProject: (project: Project | null) => void
}

export const useNavStore = create<NavState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    openDialog: (dialog) => set({ open: dialog }),
    closeDialog: () => set({ open: null }),
    currentProject: null,
    setCurrentProject: (project) => set({ currentProject: project }),
}))
