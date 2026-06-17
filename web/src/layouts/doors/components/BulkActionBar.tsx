import { useState } from 'react';
import { useSelection } from '../../../store/selection';
import { useDoorGroups } from '../../../store/doorGroups';
import { X, MoveRight, Trash2, Pencil } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { fetchNui } from '../../../utils/fetchNui';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store';
import { useDoors } from '../../../store/doors';
import { convertData } from '../../../utils/convertData';

export const BulkActionBar = () => {
  const { selectedDoors, clearSelection } = useSelection();
  const doorGroups = useDoorGroups((state) => state.doorGroups);
  const doors = useDoors((state) => state.doors);
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (selectedDoors.length === 0) return null;

  const handleEditBulk = () => {
    // Pegar a primeira porta como molde
    const firstDoor = doors.find(d => d.id === selectedDoors[0]);
    if (firstDoor) {
      useStore.setState({ ...convertData(firstDoor), isBulkEdit: true }, true);
      navigate('/settings/general');
    }
  };

  const handleMoveToGroup = (groupId: number | 'ungrouped') => {
    fetchNui('moveDoorsToGroup', {
      doorIds: selectedDoors,
      groupId: groupId === 'ungrouped' ? null : groupId
    });
    clearSelection();
  };

  return (
    <div className="flex flex-1 items-center justify-between animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
          {selectedDoors.length}
        </div>
        <span className="font-semibold text-foreground">Portas Selecionadas</span>
      </div>

      <div className="flex items-center gap-2">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-primary/20">
              <MoveRight size={16} />
              Mover de Grupo
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-[201] w-56 p-2 bg-card border border-border rounded-xl shadow-xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95" sideOffset={5}>
              <div className="flex flex-col gap-1 max-h-60 overflow-auto custom-scrollbar">
                <button
                  onClick={() => handleMoveToGroup('ungrouped')}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-left rounded-md hover:bg-muted text-foreground transition-colors"
                >
                  Remover do Grupo (Sem Grupo)
                </button>
                <div className="h-px bg-border/50 my-1 mx-2" />
                {Object.values(doorGroups).map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleMoveToGroup(group.id)}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-left rounded-md hover:bg-muted text-foreground transition-colors"
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <button
          onClick={handleEditBulk}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20"
          title="Editar portas selecionadas em massa"
        >
          <Pencil size={16} />
          Editar
        </button>

        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-destructive/20 ml-2"
          title="Excluir portas selecionadas"
        >
          <Trash2 size={16} />
          Excluir Selecionadas
        </button>

        <button
          onClick={clearSelection}
          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors ml-2"
          title="Limpar seleção"
        >
          <X size={20} />
        </button>
      </div>

      {confirmDelete && (
        <>
          <div 
            className="fixed inset-0 z-[300] bg-background/80 backdrop-blur-sm" 
            onClick={() => setConfirmDelete(false)} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Excluir Portas</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir as {selectedDoors.length} portas selecionadas? Esta ação não poderá ser desfeita.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
                onClick={() => {
                  fetchNui('deleteDoorsBulk', selectedDoors);
                  clearSelection();
                  setConfirmDelete(false);
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
