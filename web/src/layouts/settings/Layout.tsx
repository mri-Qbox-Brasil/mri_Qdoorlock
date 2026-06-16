import { Plus } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  setter: () => void;
}

const Layout: React.FC<Props> = ({ children, setter }) => {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {children}
      </div>
      <button
        title="Adicionar linha"
        onClick={setter}
        className="w-full flex items-center justify-center h-9 rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default Layout;
