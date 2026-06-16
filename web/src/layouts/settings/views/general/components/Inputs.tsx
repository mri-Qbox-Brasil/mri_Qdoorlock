import Input from './Input';
import { useStore, useSetters } from '../../../../../store';

const Inputs: React.FC = () => {
  const doorName = useStore((state) => state.name);
  const passcode = useStore((state) => state.passcode);
  const autolockInterval = useStore((state) => state.autolock);
  const interactDistance = useStore((state) => state.maxDistance);
  const doorRate = useStore((state) => state.doorRate);

  const setDoorName = useSetters((setter) => setter.setName);
  const setPasscode = useSetters((setter) => setter.setPasscode);
  const setAutolockInterval = useSetters((setter) => setter.setAutolock);
  const setInteractDistance = useSetters((setter) => setter.setMaxDistance);
  const setDoorRate = useSetters((setter) => setter.setDoorRate);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Input label="Nome da porta" type="text" value={doorName || ''} setValue={(v: string) => setDoorName(v)} />
      <Input label="Senha" type="text" value={passcode || ''} setValue={(v: string) => setPasscode(v)} />
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
      <div className="col-span-2">
        <Input
          label="Velocidade de trancamento"
          type="number"
          value={doorRate || 0}
          setValue={(v: number) => setDoorRate(v)}
          tooltip="Velocidade à qual a porta será trancada automaticamente"
        />
      </div>
    </div>
  );
};

export default Inputs;
