import { Plus, X, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVisibility } from '../../../store/visibility';
import { fetchNui } from '../../../utils/fetchNui';
import Searchbar from './Search';
import { useStore, defaultState } from '../../../store';
import { useDoors } from '../../../store/doors';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const setVisible = useVisibility((state) => state.setVisible);
  const doorsCount = useDoors((state) => state.doors.length);

  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-background">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground tracking-wide">Portas</h1>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">
          {doorsCount} Registros
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Searchbar />
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
    </div>
  );
};

export default Header;
