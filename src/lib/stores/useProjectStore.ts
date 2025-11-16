import { create } from "zustand"
import { Section } from "@/app/dashboard/projects/[id]/list/types/task"

export type ProjectDialogType = "createSection" |"deleteSection" | "createTask" |"deleteTask"| "detail" | "deleteProject"

interface ProjectState {
    open: ProjectDialogType | null
    setOpen: (dialog: ProjectDialogType | null) => void

    // task
    currentRowId: string | null
    setCurrentRow: (taskId: string | null) => void

    // section
    currentSection: Section | null
    setCurrentSection: (section: Section | null) => void

    // helpers
    openDialog: (dialog: ProjectDialogType, opts?: { rowId?: string | null }) => void
    closeAll: () => void
    reset: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    open: null,
    setOpen: (dialog) => {
        if (get().open === dialog) return
        set({ open: dialog })
    },

    currentRowId: null,
    setCurrentRow: (taskId) => {
        if (get().currentRowId === taskId) return
        set({ currentRowId: taskId })
    },

    currentSection: null,
    setCurrentSection: (section) => {
        if (get().currentSection === section) return
        set({ currentSection: section })
    },

    openDialog: (dialog, opts) => {
        const nextRowId = opts?.rowId ?? get().currentRowId ?? null
        const patch: Partial<ProjectState> = {}
        if (get().open !== dialog) patch.open = dialog
        if (get().currentRowId !== nextRowId) patch.currentRowId = nextRowId
        if (Object.keys(patch).length) set(patch)
    },

    closeAll: () => {
        const s = get()
        if (s.open !== null || s.currentRowId !== null || s.currentSection !== null) {
            set({ open: null, currentRowId: null, currentSection: null })
        }
    },

    reset: () => set({ open: null, currentRowId: null, currentSection: null }),
}))
