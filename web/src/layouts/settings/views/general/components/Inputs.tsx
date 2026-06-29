import Input from './Input';
import { useStore, useSetters } from '../../../../../store';
import { MriSelect } from '../../../../../components/molecules/MriSelect';
import { useTranslation } from 'react-i18next';
import { Type, KeyRound, Timer, ScanLine, Gauge, Fingerprint } from 'lucide-react';

const Inputs: React.FC = () => {
  const { t } = useTranslation();
  const isBulkEdit = useStore((state) => state.isBulkEdit);
  const doorName = useStore((state) => state.name);
  const passcode = useStore((state) => state.passcode);
  const passcodeType = useStore((state) => state.passcodeType);
  const autolockInterval = useStore((state) => state.autolock);
  const interactDistance = useStore((state) => state.maxDistance);
  const doorRate = useStore((state) => state.doorRate);

  const setDoorName = useSetters((setter) => setter.setName);
  const setPasscode = useSetters((setter) => setter.setPasscode);
  const setPasscodeType = useSetters((setter) => setter.setPasscodeType);
  const setAutolockInterval = useSetters((setter) => setter.setAutolock);
  const setInteractDistance = useSetters((setter) => setter.setMaxDistance);
  const setDoorRate = useSetters((setter) => setter.setDoorRate);

  const isNumericPasscode = passcodeType === 'numeric';
  const hasLetters = passcode && /[^0-9]/.test(passcode);
  const passcodeError = (isNumericPasscode && hasLetters) 
    ? t('ui_passcode_numeric_error') 
    : undefined;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Input 
        label={t('ui_door_name_label')} 
        type="text" 
        value={isBulkEdit ? t('ui_door_name_bulk_placeholder') : doorName || ''} 
        setValue={(v: string) => setDoorName(v)} 
        disabled={isBulkEdit}
        icon={<Type size={14} />}
      />
      <Input 
        label={t('ui_passcode_label')} 
        type="text" 
        value={passcode || ''} 
        setValue={(v: string) => setPasscode(v)} 
        error={passcodeError}
        icon={<KeyRound size={14} />}
      />
      <Input
        label={t('ui_autolock_label')}
        type="number"
        value={autolockInterval || 0}
        setValue={(v: number) => setAutolockInterval(v)}
        tooltip={t('ui_autolock_tooltip')}
        icon={<Timer size={14} />}
      />
      <Input
        label={t('ui_interact_distance_label')}
        type="number"
        value={interactDistance || 0}
        setValue={(v: number) => setInteractDistance(v)}
        tooltip={t('ui_interact_distance_tooltip')}
        icon={<ScanLine size={14} />}
      />
      <div className="col-span-1">
        <Input
          label={t('ui_door_rate_label')}
          type="number"
          value={doorRate || 0}
          setValue={(v: number) => setDoorRate(v)}
          tooltip={t('ui_door_rate_tooltip')}
          icon={<Gauge size={14} />}
        />
      </div>
      <div className="col-span-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="text-muted-foreground/70"><Fingerprint size={14} /></div>
          <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">{t('ui_passcode_type_label')}</label>
        </div>
        <MriSelect
          size="default"
          className="bg-card/60 border-border/30 font-normal text-sm hover:bg-card hover:border-border/60 transition-all duration-150 h-9"
          options={[
            { label: t('ui_passcode_type_text'), value: 'text' },
            { label: t('ui_passcode_type_numeric'), value: 'numeric' },
            { label: t('ui_passcode_type_facial'), value: 'facial', disabled: true },
            { label: t('ui_passcode_type_biometric'), value: 'biometric', disabled: true },
            { label: t('ui_passcode_type_vehicular'), value: 'vehicular', disabled: true },
          ]}
          value={passcodeType || 'text'}
          onChange={(val) => setPasscodeType(val)}
          placeholder={t('ui_select_placeholder')}
        />
      </div>
    </div>
  );
};

export default Inputs;
