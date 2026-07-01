import Header from './components/Header';
import DoorTable from './components/DoorTable';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Doors: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSuccessMsg(customEvent.detail);
      setTimeout(() => setSuccessMsg(null), 3500);
    };

    window.addEventListener('showSuccessToast', handleToast);
    return () => window.removeEventListener('showSuccessToast', handleToast);
  }, []);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {successMsg && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 bg-card border border-border/80 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shadow-inner shadow-primary/20">
            <CheckCircle2 size={18} />
          </div>
          <span className="text-sm font-semibold text-foreground">{t(successMsg)}</span>
        </div>
      )}
      <Header />
      <DoorTable />
    </div>
  );
};

export default Doors;
