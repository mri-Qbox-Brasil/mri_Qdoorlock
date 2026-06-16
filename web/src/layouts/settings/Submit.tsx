import { ClipboardCheck, Trash2, Save } from 'lucide-react';
import { useStore } from '../../store';
import { fetchNui } from '../../utils/fetchNui';
import { useClipboard } from '../../store/clipboard';
import { useVisibility } from '../../store/visibility';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Submit: React.FC = () => {
  const navigate = useNavigate();
  const clipboard = useClipboard((state) => state.clipboard);
  const setVisible = useVisibility((state) => state.setVisible);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = () => {
    const data = { ...useStore.getState() };
    if (data.name === '') data.name = null;
    if (data.passcode === '') data.passcode = null;
    if (data.lockSound === '') data.lockSound = null;
    if (data.unlockSound === '') data.unlockSound = null;

    data.autolock = data.autolock || null;
    data.maxDistance = data.maxDistance || 2;
    data.doorRate = data.doorRate ? data.doorRate + 0.0 : null;
    data.auto = data.auto || null;
    data.lockpick = data.lockpick || null;
    data.hideUi = data.hideUi || null;
    data.holdOpen = data.holdOpen || null;

    if (data.items && data.items.length > 0) {
      const items = [];
      for (let i = 0; i < data.items?.length; i++) {
        const itemField = data.items[i];
        if (itemField.name && itemField.name !== '') {
          if (itemField.metadata === '') itemField.metadata = null;
          if (!itemField.remove) itemField.remove = null;
          items.push(itemField);
        }
      }
      // @ts-ignore
      data.items = items;
    }

    if (data.characters && data.characters.length > 0) {
      const charactersArr: Array<string | number> = [];
      for (let i = 0; i < data.characters.length; i++) {
        const characterField = data.characters[i];
        if (characterField && characterField !== '') {
          charactersArr.push(Number.isNaN(+characterField) ? characterField : +characterField);
        }
      }
      // @ts-ignore
      data.characters = charactersArr;
    }

    if (data.groups && data.groups.length > 0) {
      const groupsObj: { [key: string]: number } = {};
      for (let i = 0; i < data.groups.length; i++) {
        const groupField = data.groups[i];
        if (groupField.name && groupField.name !== '') groupsObj[groupField.name] = groupField.grade || 0;
      }
      // @ts-ignore
      data.groups = groupsObj;
    } // @ts-ignore
    else data.groups = null;

    if (data.lockpickDifficulty && data.lockpickDifficulty.length > 0) {
      const lockpickArr = [];
      for (let i = 0; i < data.lockpickDifficulty.length; i++) {
        const field = data.lockpickDifficulty[i];
        if (field !== '') lockpickArr.push(field);
      }
      data.lockpickDifficulty = lockpickArr;
    }

    setVisible(false);
    fetchNui('createDoor', data);
  };

  const hasId = !!useStore.getState().id;

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-border">
      <button
        onClick={handleSubmit}
        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Save size={15} />
        Salvar Porta
      </button>

      {/* Paste clipboard */}
      <button
        title={!clipboard ? 'Nenhuma configuração copiada' : 'Aplicar configurações copiadas'}
        disabled={!clipboard}
        onClick={() => {
          if (!clipboard) return;
          useStore.setState({
            name: '',
            passcode: clipboard.passcode,
            autolock: clipboard.autolock,
            items: clipboard.items,
            characters: clipboard.characters,
            groups: clipboard.groups,
            maxDistance: clipboard.maxDistance,
            doorRate: clipboard.doorRate,
            lockSound: clipboard.lockSound,
            unlockSound: clipboard.unlockSound,
            auto: clipboard.auto,
            state: clipboard.state,
            lockpick: clipboard.lockpick,
            hideUi: clipboard.hideUi,
            doors: clipboard.doors,
            lockpickDifficulty: clipboard.lockpickDifficulty,
            holdOpen: clipboard.holdOpen,
          }, true);
          fetchNui('notify', 'Configurações aplicadas');
        }}
        className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ClipboardCheck size={16} />
      </button>

      {/* Delete */}
      {!confirmDelete ? (
        <button
          title="Deletar porta"
          disabled={!hasId}
          onClick={() => setConfirmDelete(true)}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <div className="flex gap-1">
          <button
            className="text-xs px-2 h-9 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            onClick={() => {
              fetchNui('deleteDoor', useStore.getState().id);
              navigate('/');
              setConfirmDelete(false);
            }}
          >
            Confirmar
          </button>
          <button
            className="text-xs px-2 h-9 rounded-md border border-border hover:bg-muted transition-colors"
            onClick={() => setConfirmDelete(false)}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default Submit;
