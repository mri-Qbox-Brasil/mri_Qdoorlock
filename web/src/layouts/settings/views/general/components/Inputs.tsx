import Input from './Input';
import { useStore, useSetters } from '../../../../../store';
import { MriSelect } from '../../../../../components/molecules/MriSelect';
import { useTranslation } from 'react-i18next';

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
      />
      <Input 
        label={t('ui_passcode_label')} 
        type="text" 
        value={passcode || ''} 
        setValue={(v: string) => setPasscode(v)} 
        error={passcodeError}
      />
      <Input
        label={t('ui_autolock_label')}
        type="number"
        value={autolockInterval || 0}
        setValue={(v: number) => setAutolockInterval(v)}
        tooltip={t('ui_autolock_tooltip')}
      />
      <Input
        label={t('ui_interact_distance_label')}
        type="number"
        value={interactDistance || 0}
        setValue={(v: number) => setInteractDistance(v)}
        tooltip={t('ui_interact_distance_tooltip')}
      />
      <div className="col-span-1">
        <Input
          label={t('ui_door_rate_label')}
          type="number"
          value={doorRate || 0}
          setValue={(v: number) => setDoorRate(v)}
          tooltip={t('ui_door_rate_tooltip')}
        />
      </div>
      <div className="col-span-1 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <label className="text-xs font-medium text-muted-foreground">{t('ui_passcode_type_label')}</label>
        </div>
        <MriSelect
          size="sm"
          className="bg-muted/50 border-border font-normal text-sm"
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
