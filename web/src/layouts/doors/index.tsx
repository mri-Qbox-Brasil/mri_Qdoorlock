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
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-green-500/15 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl shadow-xl shadow-green-500/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={16} className="text-green-500" />
          <span className="text-sm font-medium tracking-wide">{t(successMsg)}</span>
        </div>
      )}
      <Header />
      <DoorTable />
    </div>
  );
};

export default Doors;
