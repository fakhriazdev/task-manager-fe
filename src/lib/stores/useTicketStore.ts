import { create } from 'zustand';
import {TicketList} from "@/lib/ticket/TicketTypes";

type TicketDialogType = 'detail' | 'confirm' | 'complete' | 'pending';

interface TicketState {
    open: TicketDialogType | null;
    setOpen: (dialog: TicketDialogType | null) => void;
    currentRow: TicketList | null;
    setCurrentRow: (tickets: TicketList | null) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
    open: null,
    setOpen: (dialog) => set({ open: dialog }),
    currentRow: null,
    setCurrentRow: (tickets) => set({ currentRow: tickets }),
}));
