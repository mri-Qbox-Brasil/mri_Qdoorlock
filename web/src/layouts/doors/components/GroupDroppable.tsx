import { useState } from 'react';
import { DoorGroup } from '../../../store/doorGroups';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, Plus, Trash2, MapPin, Navigation, Bug, Check, Pencil, AlertTriangle } from 'lucide-react';
import { fetchNui } from '../../../utils/fetchNui';
import { useDoors } from '../../../store/doors';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Switch from '@radix-ui/react-switch';
import { useSelection } from '../../../store/selection';
import { useStore } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { useVisibility } from '../../../store/visibility';
import { useDebug } from '../../../store/debug';
import { defaultState } from '../../../store';
import { useTranslation } from 'react-i18next';

export const GroupDroppable = ({ group, children, onOpen }: { group: DoorGroup | 'ungrouped'; children: React.ReactNode; onOpen?: () => void }) => {
  const { t } = useTranslation();
  const isUngrouped = group === 'ungrouped';
  const groupId = isUngrouped ? 'ungrouped' : group.id;
  const groupName = isUngrouped ? t('ui_group_ungrouped') : group.name;

  const doors = useDoors((state) => state.doors);
  const { selectedDoors, setSelectedDoors } = useSelection();

  // Find all doors belonging to this group
  const groupDoorIds = doors.filter(d => isUngrouped ? !d.doorGroupId : d.doorGroupId === group.id).map(d => d.id);
  
  // Check if all doors in this group are selected
  const allSelected = groupDoorIds.length > 0 && groupDoorIds.every(id => selectedDoors.includes(id));
  const someSelected = groupDoorIds.some(id => selectedDoors.includes(id));

  const handleToggleGroupSelection = () => {
    if (groupDoorIds.length === 0) return;

    if (allSelected) {
      // Deselect all in group
      setSelectedDoors(selectedDoors.filter(id => !groupDoorIds.includes(id)));
    } else {
      // Select all in group (merge existing with new, avoiding duplicates)
      const newSelected = [...new Set([...selectedDoors, ...groupDoorIds])];
      setSelectedDoors(newSelected);
      if (onOpen) onOpen();
    }
  };

  const navigate = useNavigate();
  const setVisible = useVisibility((state) => state.setVisible);
  const { debugGroupId, toggleDebugGroup } = useDebug();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [updateCoords, setUpdateCoords] = useState(false);

  const isDebugging = !isUngrouped && debugGroupId === group.id;

  const handleCreateDoorInGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUngrouped) return;
    
    useStore.setState({ ...defaultState, doorGroupId: group.id, hasT3Lockpick: useStore.getState().hasT3Lockpick }, true);
    navigate('/settings/general');
  };

  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUngrouped) return;
    setConfirmDelete(true);
  };

  const handleTeleportGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUngrouped || !group.coords) return;
    setVisible(false);
    fetchNui('teleportToGroup', group.id);
    if (window.location.search.includes('embedded=1') && window.parent !== window) {
      window.parent.postMessage({ type: 'mri-plugin/request-close' }, '*');
    }
  };

  const handleToggleDebug = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUngrouped) return;
    toggleDebugGroup(group.id);
    fetchNui('toggleGroupDebug', isDebugging ? null : group.id);
  };

  return (
    <>
    <Accordion.Item value={`group-${groupId}`} className="mb-4 bg-card/40 border border-border/40 rounded-2xl overflow-hidden shadow-sm">
      <Accordion.Header>
        <Accordion.Trigger className="w-full flex items-center justify-between p-4 hover:bg-card/80 transition-colors group">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="mr-1 flex items-center justify-center flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox.Root
                className="flex h-5 w-5 appearance-none items-center justify-center rounded-md border border-primary/40 bg-background hover:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                checked={allSelected ? true : (someSelected ? 'indeterminate' : false)}
                onCheckedChange={handleToggleGroupSelection}
              >
                <Checkbox.Indicator className="text-primary-foreground flex items-center justify-center">
                  {allSelected ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <div className="w-2.5 h-0.5 bg-primary-foreground rounded-full" />
                  )}
                </Checkbox.Indicator>
              </Checkbox.Root>
            </div>
            
            <ChevronDown size={20} className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0" />
            <span className="font-bold text-lg text-foreground tracking-wide truncate" title={groupName}>{groupName}</span>
            {!isUngrouped && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2 min-w-0 truncate">
                <MapPin size={12} className="opacity-60 flex-shrink-0" />
                <span className="truncate">
                  {group.streetName || (group.coords ? `${Math.round(group.coords.x)}, ${Math.round(group.coords.y)}` : 'N/A')}
                </span>
              </span>
            )}
          </div>
          
          {!isUngrouped && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateDoorInGroup}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-sm font-bold transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>{t('ui_new_door_btn')}</span>
              </button>

              <div className="w-px h-6 bg-border mx-1"></div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const newDebugState = !isDebugging;
                    toggleDebugGroup(group.id);
                    fetchNui('toggleGroupDebug', newDebugState ? group.id : null);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 mr-1 rounded-lg border transition-all ${
                    isDebugging 
                      ? 'bg-primary/10 border-primary/40 text-primary shadow-sm' 
                      : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border hover:bg-card'
                  }`}
                  title={t('ui_debug_group_tooltip')}
                >
                  <Bug size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t('ui_debug_btn')}</span>
                </button>

                <button
                  onClick={handleTeleportGroup}
                  className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                  title={t('ui_teleport_group_tooltip')}
                >
                  <Navigation size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditName(groupName);
                    setUpdateCoords(false);
                    setIsEditing(true);
                  }}
                  className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                  title={t('ui_edit_group_tooltip')}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  title={t('ui_delete_group_tooltip')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
        <div 
          className="p-4 pt-0 min-h-[100px] transition-colors duration-300 bg-transparent"
        >
          <div className="space-y-3 pt-4 border-t border-border/20">
            {children}
            {(!children || (Array.isArray(children) && children.length === 0)) && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground/50 border-2 border-dashed border-border/40 rounded-xl">
                {t('ui_group_empty')}
              </div>
            )}
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
    {confirmDelete && !isUngrouped && (
      <>
        <div 
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm" 
          onClick={() => setConfirmDelete(false)} 
        />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
              <Trash2 size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('ui_delete_group_modal_title')}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            {t('ui_delete_group_modal_desc', { groupName })}
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
              onClick={() => setConfirmDelete(false)}
            >
              {t('ui_btn_cancel')}
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
              onClick={() => {
                fetchNui('deleteGroup', group.id);
                setConfirmDelete(false);
              }}
            >
              {t('ui_btn_delete')}
            </button>
          </div>
        </div>
      </>
    )}
    
    {isEditing && !isUngrouped && (
      <>
        <div 
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm" 
          onClick={() => setIsEditing(false)} 
        />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[400px] bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <Pencil size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('ui_edit_group_modal_title')}</h3>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('ui_group_name_label') || 'Group Name'}</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder={t('ui_group_name_placeholder')}
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <MapPin size={16} />
                <h4 className="font-semibold text-sm">{t('ui_edit_group_location_title') || 'Location'}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {t('ui_edit_group_location_desc') || 'Update the group coordinates to your current position in the game.'}
              </p>
              <button
                type="button"
                onClick={() => setUpdateCoords(!updateCoords)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  updateCoords 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                    : 'bg-background text-foreground border-border hover:bg-muted hover:border-border/80'
                }`}
              >
                {updateCoords && <Check size={14} />}
                {t('ui_edit_group_save_location_btn') || 'Update Location to Current'}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
              onClick={() => setIsEditing(false)}
            >
              {t('ui_btn_cancel')}
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              onClick={() => {
                fetchNui('editGroup', {
                  id: group.id,
                  name: editName,
                  updateCoords: updateCoords
                });
                setIsEditing(false);
              }}
            >
              {t('ui_btn_save') || 'SAVE'}
            </button>
          </div>
        </div>
      </>
    )}
    </>
  );
};
