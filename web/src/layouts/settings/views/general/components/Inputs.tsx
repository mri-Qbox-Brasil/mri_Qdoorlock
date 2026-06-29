import Input from './Input';
import { useStore, useSetters } from '../../../../../store';
import { MriSelect } from '../../../../../components/molecules/MriSelect';

const Inputs: React.FC = () => {
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
    ? 'Remova as letras, fechadura numérica aceita apenas números.' 
    : undefined;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Input 
        label="Nome da porta" 
        type="text" 
        value={isBulkEdit ? 'Nomes mantidos (Edição em Massa)' : doorName || ''} 
        setValue={(v: string) => setDoorName(v)} 
        disabled={isBulkEdit}
      />
      <Input 
        label="Senha" 
        type="text" 
        value={passcode || ''} 
        setValue={(v: string) => setPasscode(v)} 
        error={passcodeError}
      />
      <Input
        label="Auto-trancamento (s)"
        type="number"
        value={autolockInterval || 0}
        setValue={(v: number) => setAutolockInterval(v)}
        tooltip="Tempo em segundos após o qual a porta será trancada"
      />
      <Input
        label="Distância de interação"
        type="number"
        value={interactDistance || 0}
        setValue={(v: number) => setInteractDistance(v)}
        tooltip="Distância na qual o jogador pode interagir com a porta"
      />
      <div className="col-span-1">
        <Input
          label="Velocidade de trancamento"
          type="number"
          value={doorRate || 0}
          setValue={(v: number) => setDoorRate(v)}
          tooltip="Velocidade à qual a porta será trancada automaticamente"
        />
      </div>
      <div className="col-span-1 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <label className="text-xs font-medium text-muted-foreground">Tipo de Fechadura</label>
        </div>
        <MriSelect
          options={[
            { label: 'Texto (Letras e Números)', value: 'text' },
            { label: 'Teclado Numérico', value: 'numeric' },
          ]}
          value={passcodeType || 'text'}
          onChange={(val) => setPasscodeType(val)}
          placeholder="Selecionar tipo..."
        />
      </div>
    </div>
  );
};

export default Inputs;
