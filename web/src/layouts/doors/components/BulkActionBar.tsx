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
import { useTranslation } from 'react-i18next';

export const BulkActionBar = () => {
  const { selectedDoors, clearSelection } = useSelection();
  const doorGroups = useDoorGroups((state) => state.doorGroups);
  const doors = useDoors((state) => state.doors);
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { t } = useTranslation();

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
        <span className="font-semibold text-foreground">
          {selectedDoors.length === 1 ? t('ui_bulk_selected_door') : t('ui_bulk_selected_doors')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-primary/20">
              <MoveRight size={16} />
              {t('ui_bulk_move_group')}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-[201] w-56 p-2 bg-card border border-border rounded-xl shadow-xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95" sideOffset={5}>
              <div className="flex flex-col gap-1 max-h-60 overflow-auto custom-scrollbar">
                <button
                  onClick={() => handleMoveToGroup('ungrouped')}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-left rounded-md hover:bg-muted text-foreground transition-colors"
                >
                  {t('ui_bulk_remove_group')}
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
          title={selectedDoors.length === 1 ? t('ui_edit_door_tooltip') : t('ui_bulk_edit_doors')}
        >
          <Pencil size={16} />
          {selectedDoors.length === 1 ? t('ui_bulk_edit_door') : t('ui_bulk_edit_doors')}
        </button>

        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-destructive/20 ml-2"
          title={t('ui_bulk_delete_title')}
        >
          <Trash2 size={16} />
          {selectedDoors.length === 1 ? t('ui_bulk_delete_door') : t('ui_bulk_delete_doors')}
        </button>

        <button
          onClick={clearSelection}
          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors ml-2"
          title={t('ui_bulk_clear_selection')}
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
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-80 bg-card p-6 rounded-2xl shadow-xl w-full max-w-sm border border-border" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedDoors.length === 1 ? t('ui_bulk_delete_door') : t('ui_bulk_delete_doors')}
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                {t('ui_bulk_delete_confirm')?.replace('{{count}}', selectedDoors.length.toString())}
              </p>
                        <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setConfirmDelete(false)}
                >
                  {t('ui_btn_cancel')}
                </button>
                <button
                  className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-destructive/20"
                  onClick={() => {
                    fetchNui('deleteDoorsBulk', selectedDoors);
                    clearSelection();
                    setConfirmDelete(false);
                  }}
                >
                  {t('ui_btn_delete')}
                </button>
              </div>
          </div>
        </>
      )}
    </div>
  );
};
