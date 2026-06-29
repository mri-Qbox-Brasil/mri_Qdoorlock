import { useSetters, useStore } from '../../../../store';
import { MriSelect } from '../../../../components/molecules/MriSelect';

const Sound: React.FC = () => {
  const sounds = useSetters((state) => state.sounds);
  const lockSound = useStore((state) => state.lockSound);
  const unlockSound = useStore((state) => state.unlockSound);
  const setLockSound = useSetters((setter) => setter.setLockSound);
  const setUnlockSound = useSetters((setter) => setter.setUnlockSound);

  const options = sounds.map((s) => ({ label: s, value: s }));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Som ao trancar a porta</label>
        <MriSelect
          options={options}
          value={lockSound || ''}
          onChange={(val) => setLockSound(val || null)}
          placeholder="Selecionar som..."
          clearable
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Som ao destrancar a porta</label>
        <MriSelect
          options={options}
          value={unlockSound || ''}
          onChange={(val) => setUnlockSound(val || null)}
          placeholder="Selecionar som..."
          clearable
        />
      </div>
    </div>
  );
};

export default Sound;
