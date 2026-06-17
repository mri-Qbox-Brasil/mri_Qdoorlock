import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { fetchNui } from './utils/fetchNui';
import { useNuiEvent } from './hooks/useNuiEvent';
import { defaultState, useSetters, useStore } from './store';
import Doors from './layouts/doors';
import Settings from './layouts/settings';
import { useVisibility } from './store/visibility';
import { useExitListener } from './hooks/useExitListener';
import { useDoors } from './store/doors';
import { DoorColumn } from './store/doors';
import { convertData } from './utils/convertData';
import ThemeSync from './components/ThemeSync';
import { useDoorGroups, DoorGroup } from './store/doorGroups';
import { useDebug } from './store/debug';
import PasscodePrompt from './components/PasscodePrompt';

const App: React.FC = () => {
  const setSounds = useSetters((setter) => setter.setSounds);
  const [visible, setVisible] = useVisibility((state) => [state.visible, state.setVisible]);
  const doors = useDoors((state) => state.doors);
  const setDoors = useDoors((state) => state.setDoors);
  const doorGroups = useDoorGroups((state) => state.doorGroups);
  const setDoorGroups = useDoorGroups((state) => state.setDoorGroups);
  const toggleDebugGroup = useDebug((state) => state.toggleDebugGroup);
  const navigate = useNavigate();
  const [deleteDoorId, setDeleteDoorId] = useState<number | null>(null);

  useNuiEvent('confirmDeleteDoor', (id: number) => {
    setDeleteDoorId(id);
  });

  useNuiEvent('setDebugGroup', (data: null) => {
    // If we receive setDebugGroup with nil/null, we clear the debug state
    useDebug.setState({ debugGroupId: null });
  });

  useNuiEvent('playSound', async (data: { sound: string; volume: number }) => {
    const sound = new Audio(`./sounds/${data.sound}.ogg`);
    sound.volume = data.volume;
    await sound.play();
  });

  useNuiEvent('setSoundFiles', (data: string[]) => setSounds(data));

  useNuiEvent('setVisible', (data: number) => {
    setVisible(true);
    if (data === undefined) return navigate('/');
    for (let i = 0; i < doors.length; i++) {
      if (doors[i].id === data) {
        useStore.setState(convertData(doors[i]), true);
        navigate('/settings/general');
        break;
      }
    }
  });

  useNuiEvent('updateDoorData', (data: DoorColumn | number) => {
    if (typeof data === 'number') return setDoors(doors.filter((door) => door.id !== data));
    else {
      if (data.hasOwnProperty('id')) {
        let index = doors.length;
        for (let i = 0; i < index; i++) {
          const door = Object.values(doors)[i];
          if (door.id == data.id) {
            index = i;
            break;
          }
        }
        return setDoors(Object.values({ ...doors, [index]: data } as DoorColumn[]));
      }
      return setDoors(Object.values(data));
    }
  });

  useNuiEvent('updateDoorGroups', (data: Record<number, DoorGroup> | { id: number, data?: DoorGroup }) => {
    if ('id' in data) {
      const id = data.id as number;
      if (data.data) {
        setDoorGroups({ ...doorGroups, [id]: data.data });
      } else {
        const newGroups = { ...doorGroups };
        delete newGroups[id];
        setDoorGroups(newGroups);
      }
    } else {
      setDoorGroups(data as Record<number, DoorGroup>);
    }
  });

  useExitListener(setVisible, () => {
    setDeleteDoorId(null);
  });

  return (
    <div className="w-full h-full flex justify-center items-center p-8">
      <ThemeSync />
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
        `}
        style={{ width: 950, height: 650 }}
      >
        <div className="w-full h-full bg-background border border-border/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Doors />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </div>
      </div>

      {/* Delete Modal for debug */}
      {deleteDoorId !== null && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-transparent" 
            onClick={() => { setDeleteDoorId(null); fetchNui('exit'); }} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Deletar Porta</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja deletar permanentemente esta porta? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                onClick={() => { setDeleteDoorId(null); fetchNui('exit'); }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
                onClick={() => {
                  fetchNui('deleteDoor', deleteDoorId);
                  setDeleteDoorId(null);
                  fetchNui('exit');
                }}
              >
                Deletar
              </button>
            </div>
          </div>
        </>
      )}

      <PasscodePrompt />
    </div>
  );
};

export default App;
