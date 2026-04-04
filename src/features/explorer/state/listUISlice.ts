import type { StateCreator } from "zustand";

export interface ListUISlice {
    listOpen: boolean;
    listScrollTop: number;
    setListOpen: (open: boolean) => void;
    setListScrollTop: (scrollTop: number) => void;
}

export const createListUISlice: StateCreator<ListUISlice> = (set) => ({
    listOpen: false,
    listScrollTop: 0,
    setListOpen: (listOpen) => set({ listOpen }),
    setListScrollTop: (listScrollTop) => set({ listScrollTop }),
});
