import create from 'zustand';

interface SelectionState {
  selectedDoors: number[];
  toggleSelection: (id: number) => void;
  clearSelection: () => void;
  isSelected: (id: number) => boolean;
  setSelectedDoors: (ids: number[]) => void;
}

export const useSelection = create<SelectionState>((set, get) => ({
  selectedDoors: [],
  toggleSelection: (id) =>
    set((state) => ({
      selectedDoors: state.selectedDoors.includes(id)
        ? state.selectedDoors.filter((doorId) => doorId !== id)
        : [...state.selectedDoors, id],
    })),
  clearSelection: () => set({ selectedDoors: [] }),
  isSelected: (id) => get().selectedDoors.includes(id),
  setSelectedDoors: (ids) => set({ selectedDoors: ids }),
}));
