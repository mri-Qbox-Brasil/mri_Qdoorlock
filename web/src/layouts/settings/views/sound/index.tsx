import { useSetters, useStore } from '../../../../store';
import { MriSelect } from '../../../../components/molecules/MriSelect';
import { useTranslation } from 'react-i18next';

const Sound: React.FC = () => {
  const { t } = useTranslation();
  const sounds = useSetters((state) => state.sounds);
  const lockSound = useStore((state) => state.lockSound);
  const unlockSound = useStore((state) => state.unlockSound);
  const setLockSound = useSetters((setter) => setter.setLockSound);
  const setUnlockSound = useSetters((setter) => setter.setUnlockSound);

  const options = sounds.map((s) => ({ label: s, value: s }));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('ui_lock_sound_label')}</label>
        <MriSelect
          options={options}
          value={lockSound || ''}
          onChange={(val) => setLockSound(val || null)}
          placeholder={t('ui_select_sound_placeholder')}
          clearable
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('ui_unlock_sound_label')}</label>
        <MriSelect
          options={options}
          value={unlockSound || ''}
          onChange={(val) => setUnlockSound(val || null)}
          placeholder={t('ui_select_sound_placeholder')}
          clearable
        />
      </div>
    </div>
  );
};

export default Sound;
