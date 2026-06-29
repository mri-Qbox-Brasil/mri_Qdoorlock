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
  const setLockpickDifficulty = useSetters((setter) => setter.setLockpickDifficulty);
  const lockpickData = lockpickDifficulty[modal.index];

  const [select, setSelect] = useState<string>(typeof lockpickData === 'string' ? lockpickData : 'custom');
  const [areaSize, setAreaSize] = useState<number>(typeof lockpickData === 'object' ? lockpickData?.areaSize ?? 0 : 0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(typeof lockpickData === 'object' ? lockpickData?.speedMultiplier ?? 1 : 1);
  const [errors, setErrors] = useState<{ areaSize?: string; speedMultiplier?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (select === 'custom' && !areaSize) newErrors.areaSize = t('ui_error_required');
    if (select === 'custom' && !speedMultiplier) newErrors.speedMultiplier = t('ui_error_required');
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setModal((m) => ({ ...m, opened: false }));
    const data = select === 'custom' ? { areaSize, speedMultiplier } : select;
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

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('ui_lockpick_area_label')}</label>
        <input
          type="number"
          value={areaSize}
          max={360}
          disabled={select !== 'custom'}
          onChange={(e) => setAreaSize(parseFloat(e.target.value) || 0)}
          className="h-8 px-3 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary text-foreground disabled:opacity-40"
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
          className="h-8 px-3 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary text-foreground disabled:opacity-40"
        />
        {errors.speedMultiplier && <p className="text-xs text-destructive">{errors.speedMultiplier}</p>}
      </div>

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
