import { useState } from 'react';
import { useSetters, useStore } from '../../../../../store';
import { MriSelect } from '../../../../../components/molecules/MriSelect';
import { useTranslation } from 'react-i18next';

interface Props {
  selectData: { value: string; label: string }[];
  setModal: React.Dispatch<React.SetStateAction<{ opened: boolean; index: number }>>;
  modal: { opened: boolean; index: number };
}

const DifficultyModal: React.FC<Props> = ({ selectData, setModal, modal }) => {
  const { t } = useTranslation();
  const lockpickDifficulty = useStore((store) => store.lockpickDifficulty);
  const lockpickSystem = useStore((store) => store.lockpickSystem);
  const setLockpickDifficulty = useSetters((setter) => setter.setLockpickDifficulty);
  const lockpickData = lockpickDifficulty[modal.index];

  const [select, setSelect] = useState<string>(typeof lockpickData === 'string' ? lockpickData : 'custom');
  const [areaSize, setAreaSize] = useState<number>(typeof lockpickData === 'object' && 'areaSize' in lockpickData ? lockpickData?.areaSize ?? 0 : 0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(typeof lockpickData === 'object' && 'speedMultiplier' in lockpickData ? lockpickData?.speedMultiplier ?? 1 : 1);
  const [stages, setStages] = useState<number>(typeof lockpickData === 'object' && 'stages' in lockpickData ? lockpickData?.stages ?? 1 : 1);
  
  const [t3Difficulty, setT3Difficulty] = useState<number>(typeof lockpickData === 'object' && 'difficulty' in lockpickData ? lockpickData?.difficulty ?? 2 : 2);
  const [t3Pins, setT3Pins] = useState<number>(typeof lockpickData === 'object' && 'pins' in lockpickData ? lockpickData?.pins ?? 4 : 4);

  const [errors, setErrors] = useState<{ areaSize?: string; speedMultiplier?: string; stages?: string; t3Difficulty?: string; t3Pins?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    
    if (lockpickSystem === 't3_lockpick') {
      if (select === 'custom' && (!t3Difficulty || t3Difficulty < 1)) newErrors.t3Difficulty = t('ui_error_required');
      if (select === 'custom' && (!t3Pins || t3Pins < 1)) newErrors.t3Pins = t('ui_error_required');
    } else {
      if (select === 'custom' && !areaSize) newErrors.areaSize = t('ui_error_required');
      if (select === 'custom' && !speedMultiplier) newErrors.speedMultiplier = t('ui_error_required');
      if (select === 'custom' && (!stages || stages < 1)) newErrors.stages = t('ui_error_required');
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setModal((m) => ({ ...m, opened: false }));
    let data: any = select;
    if (select === 'custom') {
      if (lockpickSystem === 't3_lockpick') {
        data = { difficulty: t3Difficulty, pins: t3Pins };
      } else {
        data = { areaSize, speedMultiplier, stages };
      }
    }
    if (!data) return;
    setLockpickDifficulty((prevState) => {
      const array = [...prevState];
      // @ts-ignore
      array[modal.index] = data;
      return array;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('ui_lockpick_difficulty_label')}</label>
        <MriSelect
          options={selectData}
          value={select}
          onChange={(val) => setSelect(val)}
        />
      </div>

      {lockpickSystem !== 't3_lockpick' ? (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{t('ui_lockpick_area_label')}</label>
            <input
              type="number"
              value={areaSize}
              max={360}
              disabled={select !== 'custom'}
              onChange={(e) => setAreaSize(parseFloat(e.target.value) || 0)}
              className="h-9 px-3 text-sm bg-card/60 border border-border/30 rounded-lg outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground disabled:opacity-40 hover:bg-card hover:border-border/60 transition-all"
            />
            {errors.areaSize && <p className="text-xs text-destructive">{errors.areaSize}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{t('ui_lockpick_speed_label')}</label>
            <input
              type="number"
              value={speedMultiplier}
              step={0.01}
              disabled={select !== 'custom'}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value) || 0)}
              className="h-9 px-3 text-sm bg-card/60 border border-border/30 rounded-lg outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground disabled:opacity-40 hover:bg-card hover:border-border/60 transition-all"
            />
            {errors.speedMultiplier && <p className="text-xs text-destructive">{errors.speedMultiplier}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{t('ui_lockpick_stages_label')}</label>
            <input
              type="number"
              value={stages}
              min={1}
              max={10}
              disabled={select !== 'custom'}
              onChange={(e) => setStages(parseInt(e.target.value) || 1)}
              className="h-9 px-3 text-sm bg-card/60 border border-border/30 rounded-lg outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground disabled:opacity-40 hover:bg-card hover:border-border/60 transition-all"
            />
            {errors.stages && <p className="text-xs text-destructive">{errors.stages}</p>}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{t('ui_t3_difficulty_label') || 'Dificuldade'}</label>
            <input
              type="number"
              value={t3Difficulty}
              min={1}
              max={10}
              disabled={select !== 'custom'}
              onChange={(e) => setT3Difficulty(parseInt(e.target.value) || 1)}
              className="h-9 px-3 text-sm bg-card/60 border border-border/30 rounded-lg outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground disabled:opacity-40 hover:bg-card hover:border-border/60 transition-all"
            />
            {errors.t3Difficulty && <p className="text-xs text-destructive">{errors.t3Difficulty}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{t('ui_t3_pins_label') || 'Quantidade de Pinos'}</label>
            <input
              type="number"
              value={t3Pins}
              min={1}
              max={20}
              disabled={select !== 'custom'}
              onChange={(e) => setT3Pins(parseInt(e.target.value) || 1)}
              className="h-9 px-3 text-sm bg-card/60 border border-border/30 rounded-lg outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground disabled:opacity-40 hover:bg-card hover:border-border/60 transition-all"
            />
            {errors.t3Pins && <p className="text-xs text-destructive">{errors.t3Pins}</p>}
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full h-8 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        {t('ui_btn_confirm')}
      </button>
    </form>
  );
};

export default DifficultyModal;
