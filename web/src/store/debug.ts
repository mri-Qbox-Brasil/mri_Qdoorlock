import create from 'zustand';

interface DebugState {
  debugGroupId: number | null;
  toggleDebugGroup: (id: number | null) => void;
}

export const useDebug = create<DebugState>((set) => ({
  debugGroupId: null,
  toggleDebugGroup: (id) => set((state) => ({
    debugGroupId: state.debugGroupId === id ? null : id
  }))
}));
