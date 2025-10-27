import { create } from 'zustand';


type ProjectDialogType = 'create' | 'detail';

interface ProjectState {
    open: ProjectDialogType | null;
    setOpen: (dialog: ProjectDialogType | null) => void;
    currentRowId: string | null;
    setCurrentRow: (taskDetail: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    currentRowId: null,
    setCurrentRow: (taskDetail) => set({ currentRowId: taskDetail }),
}));
