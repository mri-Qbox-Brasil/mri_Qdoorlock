import TooltipSwitch from './TooltipSwitch';
import { useSetters, useStore } from '../../../../../store';

const Switches: React.FC = () => {
  const locked = useStore((state) => state.state);
  const double = useStore((state) => state.doors);
  const automatic = useStore((state) => state.auto);
  const lockpick = useStore((state) => state.lockpick);
  const hideUi = useStore((state) => state.hideUi);
  const holdOpen = useStore((state) => state.holdOpen);
  const toggleCheckbox = useSetters((setter) => setter.toggleCheckbox);

  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      <TooltipSwitch label="Porta Trancada" tooltip="Define se a porta alvo está trancada por padrão" value={locked || false} toggle={() => toggleCheckbox('state')} />
      <TooltipSwitch label="Porta Dupla" tooltip="Habilitar se a porta alvo for uma porta dupla" value={double || false} toggle={() => toggleCheckbox('doors')} />
      <TooltipSwitch label="Porta Automática" tooltip="Habilite se a porta se move automaticamente (Garagens, Portões, etc...)" value={automatic || false} toggle={() => toggleCheckbox('auto')} />
      <TooltipSwitch label="Permitir Lockpick" tooltip="Ativar para permitir o uso de lockpick nesta porta" value={lockpick || false} toggle={() => toggleCheckbox('lockpick')} />
      <TooltipSwitch label="Esconder UI" tooltip="Esconde os indicadores UI para a porta alvo" value={hideUi || false} toggle={() => toggleCheckbox('hideUi')} />
      <TooltipSwitch label="Manter Aberta" tooltip="Define se a porta deve permanecer aberta enquanto destrancada" value={holdOpen || false} toggle={() => toggleCheckbox('holdOpen')} />
    </div>
  );
};

export default Switches;
