import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import { useSetters, useStore } from '../../../../store';
import LockpickFields from './components/LockpickFields';
import { useEffect } from 'react';

const Lockpick: React.FC = () => {
  const lockpickDifficulty = useStore((state) => state.lockpickDifficulty);
  const setLockpickFields = useSetters((setter) => setter.setLockpickDifficulty);
  const { t } = useTranslation();

  useEffect(() => {
    if (lockpickDifficulty.length === 0) {
      setLockpickFields(() => ['']);
    }
    return () => {
      setLockpickFields((prevState) => prevState.filter((field, index) => index === 0 || field !== ''));
    };
  }, []);

  const hasT3Lockpick = useStore((state) => state.hasT3Lockpick);
  const lockpickSystem = useStore((state) => state.lockpickSystem);
  const setLockpickSystem = useSetters((setter) => setter.setLockpickSystem);

  return (
    <Layout 
      setter={() => setLockpickFields((prevState) => [...prevState, ''])}
      title={t('ui_lockpick_title') || 'Lockpicking'}
      description={t('ui_lockpick_desc') || 'Configure if this door can be lockpicked and set its specific minigame difficulty level.'}
    >
      <div className="space-y-4">
        {hasT3Lockpick && (
          <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-card/50 border border-border/50">
            <label className="text-sm font-medium text-foreground">{t('ui_lockpick_system_label') || 'Sistema de Lockpick'}</label>
            <select
              value={lockpickSystem || 'ox_lib'}
              onChange={(e) => setLockpickSystem(e.target.value as 'ox_lib' | 't3_lockpick')}
              className="h-9 px-3 text-sm bg-background border border-border/60 rounded-md outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground transition-all"
            >
              <option value="ox_lib">ox_lib</option>
              <option value="t3_lockpick">t3_lockpick</option>
            </select>
          </div>
        )}
        <LockpickFields />
      </div>
    </Layout>
  );
};
export default Lockpick;
