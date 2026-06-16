import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Users, Briefcase, Package, ArrowLeft, Lock, Volume2 } from 'lucide-react';
import General from './views/general';
import Characters from './views/characters';
import Groups from './views/groups';
import Items from './views/items';
import Sound from './views/sound';
import Submit from './Submit';
import { useStore } from '../../store';
import Lockpick from './views/lockpick';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'back', label: 'Portas', icon: ArrowLeft, isBack: true },
  { value: 'general', label: 'Geral', icon: SettingsIcon },
  { value: 'characters', label: 'Personagens', icon: Users },
  { value: 'groups', label: 'Grupos', icon: Briefcase },
  { value: 'items', label: 'Itens', icon: Package },
  { value: 'lockpick', label: 'Lockpick', icon: Lock, requiresLockpick: true },
  { value: 'sound', label: 'Som', icon: Volume2 },
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lockpick = useStore((state) => state.lockpick);
  const activeTab = location.pathname.substring(10); // remove '/settings/'

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <nav className="flex flex-col w-52 border-r border-border bg-card/50 py-4 shrink-0">
        {tabs.map(({ value, label, icon: Icon, isBack, requiresLockpick }) => {
          const disabled = requiresLockpick && !lockpick;
          return (
            <button
              key={value}
              disabled={disabled}
              onClick={() => isBack ? navigate('/') : navigate(`/settings/${value}`)}
              className={`
                flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isBack 
                  ? 'mb-4 border border-border/40 bg-muted/10 text-muted-foreground hover:bg-muted/30 hover:text-foreground rounded-xl' 
                  : 'rounded-xl mx-2 my-0.5'
                }
                ${!isBack && activeTab === value
                  ? 'bg-primary/10 text-primary border border-primary/50 shadow-[0_0_15px_rgba(0,230,153,0.05)]'
                  : ''}
                ${!isBack && activeTab !== value
                  ? 'text-muted-foreground hover:bg-muted/20 hover:text-foreground border border-transparent'
                  : ''}
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <Icon size={15} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="flex-1 bg-background/50 flex flex-col p-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-4">
          <Routes>
            <Route path="/general" element={<General />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/items" element={<Items />} />
            <Route path="/sound" element={<Sound />} />
            <Route path="/lockpick" element={<Lockpick />} />
          </Routes>
        </div>
        <div className="shrink-0 pt-2">
          <Submit />
        </div>
      </div>
    </div>
  );
};

export default Settings;
