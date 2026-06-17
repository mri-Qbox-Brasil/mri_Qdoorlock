import create from 'zustand';

export interface DoorGroup {
  id: number;
  name: string;
  coords: { x: number; y: number; z: number };
  streetName?: string;
}

export const useDoorGroups = create<{
  doorGroups: Record<number, DoorGroup>;
  setDoorGroups: (value: Record<number, DoorGroup>) => void;
}>((set) => ({
  doorGroups: {},
  setDoorGroups: (doorGroups) => set({ doorGroups }),
}));
