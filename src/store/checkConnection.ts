// store/connectionStore.ts
import { create } from "zustand";

interface ConnectionState {
  testedUrl: string | null;
  isConnected: boolean | null; // null = not tested yet
  setConnection: (url: string, status: boolean) => void;
}

const useConnectionStore = create<ConnectionState>((set) => ({
  testedUrl: null,
  isConnected: null,
  setConnection: (url, status) => set({ testedUrl: url, isConnected: status }),
}));

export default useConnectionStore;
