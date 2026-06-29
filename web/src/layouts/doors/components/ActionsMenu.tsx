import { Pencil, Copy, Navigation, Trash2, Check, X } from 'lucide-react';
import { DoorColumn } from '../../../store/doors';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store';
import { convertData } from '../../../utils/convertData';
import { useClipboard } from '../../../store/clipboard';
import { fetchNui } from '../../../utils/fetchNui';
import { CellContext } from '@tanstack/react-table';
import { useVisibility } from '../../../store/visibility';
import { useState } from 'react';

const ActionsMenu: React.FC<{ door: DoorColumn }> = ({ door }) => {
  const navigate = useNavigate();
  const setClipboard = useClipboard((state) => state.setClipboard);
  const setVisible = useVisibility((state) => state.setVisible);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const doorId = door.id;

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          title="Editar porta"
          onClick={() => {
            useStore.setState(convertData(door), true);
            navigate('/settings/general');
          }}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil size={16} />
        </button>

        <button
          title="Duplicar Porta"
          onClick={() => {
            const cloneData = JSON.parse(JSON.stringify(door));
            delete cloneData.id;
            
            const name = cloneData.name || "Porta";
            const match = name.match(/^(.*?)\s*(\d+)$/);
            if (match) {
              const baseName = match[1];
              const num = parseInt(match[2], 10);
              cloneData.name = `${baseName}${baseName ? " " : ""}${num + 1}`;
            } else {
              cloneData.name = `${name} 2`;
            }
            
            cloneData.reselect = true;
            setVisible(false);
            fetchNui('createDoor', cloneData);
          }}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
        >
          <Copy size={16} />
        </button>

        <button
          title="Teleportar aqui"
          onClick={() => {
            setVisible(false);
            fetchNui('teleportToDoor', doorId);
            if (window.location.search.includes('embedded=1') && window.parent !== window) {
              window.parent.postMessage({ type: 'mri-plugin/request-close' }, '*');
            }
          }}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
        >
          <Navigation size={16} />
        </button>

        <button
          title="Deletar porta"
          onClick={() => setConfirmDelete(true)}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {confirmDelete && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" 
            onClick={() => setConfirmDelete(false)} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Excluir Porta</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir esta porta? Esta ação não poderá ser desfeita.
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
                  fetchNui('deleteDoor', doorId);
                  setConfirmDelete(false);
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ActionsMenu;
