import { create } from "zustand";

interface DialogState {
  isOpen: boolean;
  isClose: boolean;
  editWidgetId: string | null;
  openDialog: () => void;
  openForEdit: (widgetId: string) => void;
  closeDialog: () => void;
}

const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  isClose: true,
  editWidgetId: null,

  openDialog: () => set({ isOpen: true, isClose: false, editWidgetId: null }),
  openForEdit: (widgetId: string) => set({ isOpen: true, isClose: false, editWidgetId: widgetId }),
  closeDialog: () => set({ isOpen: false, isClose: true, editWidgetId: null }),
}));

export default useDialogStore;