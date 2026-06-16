import { useSetters, useStore } from '../../../../store';

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
        <select
          className="h-8 px-2 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary text-foreground"
          value={lockSound || ''}
          onChange={(e) => setLockSound(e.target.value || null)}
        >
          <option value="">Selecionar som...</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Som ao destrancar a porta</label>
        <select
          className="h-8 px-2 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary text-foreground"
          value={unlockSound || ''}
          onChange={(e) => setUnlockSound(e.target.value || null)}
        >
          <option value="">Selecionar som...</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
};

export default Sound;
