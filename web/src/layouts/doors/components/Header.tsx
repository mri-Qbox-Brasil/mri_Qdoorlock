import { Plus, X, Search, RefreshCw, FolderPlus, DoorClosed, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVisibility } from '../../../store/visibility';
import { fetchNui } from '../../../utils/fetchNui';
import Searchbar from './Search';
import { useStore, defaultState } from '../../../store';
import { useDoors } from '../../../store/doors';
import { useDoorGroups } from '../../../store/doorGroups';
import { useSelection } from '../../../store/selection';
import { BulkActionBar } from './BulkActionBar';
import { useState } from 'react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const setVisible = useVisibility((state) => state.setVisible);
  const doorsCount = useDoors((state) => state.doors.length);
  const groupsCount = Object.keys(useDoorGroups((state) => state.doorGroups)).length;
  const selectedCount = useSelection((state) => state.selectedDoors.length);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    fetchNui('createGroup', { name: groupName.trim() });
    setShowCreateGroup(false);
    setGroupName('');
  };

  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-background min-h-[80px]">
      {selectedCount > 0 ? (
        <BulkActionBar />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground tracking-wide">Portas</h1>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">
                <DoorClosed size={12} />
                {doorsCount} {doorsCount === 1 ? 'Porta' : 'Portas'}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                <Folder size={12} />
                {groupsCount} {groupsCount === 1 ? 'Grupo' : 'Grupos'}
              </span>
            </div>
          </div>

      <div className="flex items-center gap-2">
        <Searchbar />
        <button
          title="Criar novo grupo"
          onClick={() => {
            setShowCreateGroup(true);
          }}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-border/50 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all text-muted-foreground"
        >
          <FolderPlus size={16} />
        </button>
        <button
          title="Criar nova porta"
          onClick={() => {
            useStore.setState(defaultState, true);
            navigate('/settings/general');
          }}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-border/50 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all text-muted-foreground"
        >
          <Plus size={16} />
        </button>
        <button
          title="Fechar"
          onClick={() => {
            setVisible(false);
            fetchNui('exit');
          }}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-border/50 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all text-muted-foreground"
        >
          <X size={16} />
        </button>
      </div>
        </>
      )}

      {showCreateGroup && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" 
            onClick={() => { setShowCreateGroup(false); setGroupName(''); }} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Criar Grupo de Portas</h3>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Nome do Grupo <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Prisão Principal"
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGroup();
                  if (e.key === 'Escape') {
                    setShowCreateGroup(false);
                    setGroupName('');
                  }
                }}
              />
            </div>
            
            <div className="flex justify-between gap-3">
              <button
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors"
                onClick={() => { setShowCreateGroup(false); setGroupName(''); }}
              >
                CANCELAR
              </button>
              <button
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
