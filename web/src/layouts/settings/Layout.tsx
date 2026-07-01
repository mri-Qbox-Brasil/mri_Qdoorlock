import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: React.ReactNode;
  setter: () => void;
  title?: string;
  description?: string;
}

const Layout: React.FC<Props> = ({ children, setter, title, description }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="bg-card/40 border border-border/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-4 pb-3 border-b border-border/40 gap-4">
            <div>
              {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
              {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
            </div>
            <button
              title={t('ui_add_row_tooltip') || 'Adicionar'}
              onClick={setter}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20 transition-all"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
