import { useState, useRef } from 'react';
import { useSetters, useStore } from '../../../../store';
import { useTranslation } from 'react-i18next';
import { Play, Square, Check, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

// The server may return native audio names (underscore) or ogg filenames (hyphen).
// Convert to the actual .ogg filename used in web/build/sounds/
const SOUND_FILE_MAP: Record<string, string> = {
  'door_bolt': 'door-bolt-4',
};

function soundToFile(name: string): string {
  // If there's an explicit mapping, use it
  if (SOUND_FILE_MAP[name]) return SOUND_FILE_MAP[name];
  // Otherwise convert underscores to hyphens (button_remote -> button-remote)
  return name.replace(/_/g, '-');
}

function SoundPicker({
  label,
  sounds,
  value,
  onChange,
}: {
  label: string;
  sounds: string[];
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(null);
  };

  const handlePlay = (e: React.MouseEvent, sound: string) => {
    e.stopPropagation();

    if (playing === sound) {
      stopAudio();
      return;
    }

    stopAudio();

    const file = soundToFile(sound);
    const audio = new Audio(`./sounds/${file}.ogg`);
    audio.volume = 0.7;
    audioRef.current = audio;
    setPlaying(sound);
    audio.play().catch(() => setPlaying(null));
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
  };

  const allSounds: { name: string | null; label: string }[] = [
    { name: null, label: t('ui_sound_none') },
    ...sounds.map((s) => ({ name: s, label: s })),
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="flex flex-col gap-1">
        {allSounds.map(({ name, label: sLabel }) => {
          const isSelected = value === name;
          const isPlaying = playing === name;

          return (
            <div
              key={name ?? '__none__'}
              onClick={() => { stopAudio(); onChange(name); }}
              className={cn(
                'group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 border',
                isSelected
                  ? 'bg-primary/15 border-primary/50 shadow-sm shadow-primary/10'
                  : 'bg-card/60 border-border/30 hover:bg-card hover:border-border/60'
              )}
            >
              {/* Play button on the left */}
              {name !== null ? (
                <button
                  title={t('ui_sound_preview_tooltip')}
                  onClick={(e) => handlePlay(e, name)}
                  className={cn(
                    'shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150',
                    isPlaying
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                      : isSelected
                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                      : 'bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary'
                  )}
                >
                  {isPlaying
                    ? <Square size={9} fill="currentColor" />
                    : <Play size={9} fill="currentColor" className="translate-x-[1px]" />
                  }
                </button>
              ) : (
                <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-muted/60">
                  <VolumeX size={12} className="text-muted-foreground" />
                </div>
              )}

              {/* Sound name */}
              <span className={cn(
                'flex-1 text-sm font-medium truncate',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {sLabel}
              </span>

              {/* Check on the right when selected */}
              {isSelected && (
                <Check size={14} className="shrink-0 text-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Sound: React.FC = () => {
  const { t } = useTranslation();
  const sounds = useSetters((state) => state.sounds);
  const lockSound = useStore((state) => state.lockSound);
  const unlockSound = useStore((state) => state.unlockSound);
  const setLockSound = useSetters((setter) => setter.setLockSound);
  const setUnlockSound = useSetters((setter) => setter.setUnlockSound);

  const filteredSounds = sounds.filter((s) => s !== '');

  return (
    <div className="space-y-5">
      <SoundPicker
        label={t('ui_lock_sound_label')}
        sounds={filteredSounds}
        value={lockSound ?? null}
        onChange={(val) => setLockSound(val)}
      />
      <div className="border-t border-border/40" />
      <SoundPicker
        label={t('ui_unlock_sound_label')}
        sounds={filteredSounds}
        value={unlockSound ?? null}
        onChange={(val) => setUnlockSound(val)}
      />
    </div>
  );
};

export default Sound;
