import { ClipboardCheck, Trash2, Save, MapPin } from 'lucide-react';
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
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmReselect, setConfirmReselect] = useState(false);

  const handleSubmit = (reselect: boolean = false) => {
    const data = { ...useStore.getState() };
    if (reselect) {
      // @ts-ignore
      data.reselect = true;
    } else {
      // @ts-ignore
      data.reselect = false;
    }
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
    <>
      <div className="flex flex-col gap-2 pt-3 border-t border-border">
        {hasId && (
          <button
            onClick={() => setConfirmReselect(true)}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-md border border-primary/50 text-primary hover:bg-primary/10 text-sm font-semibold transition-colors"
          >
            <MapPin size={15} />
            Alterar Posição da Porta no Mapa
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => hasId ? setConfirmSave(true) : handleSubmit(false)}
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
          <button
            title="Deletar porta"
            disabled={!hasId}
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Reselect Modal */}
      {confirmReselect && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" 
            onClick={() => setConfirmReselect(false)} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <MapPin size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Alterar Posição</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja reposicionar esta porta no mapa? Você precisará selecionar o objeto novamente.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                onClick={() => setConfirmReselect(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                onClick={() => {
                  handleSubmit(true);
                  setConfirmReselect(false);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Save Modal */}
      {confirmSave && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" 
            onClick={() => setConfirmSave(false)} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <Save size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Salvar Alterações</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja salvar as configurações desta porta?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                onClick={() => setConfirmSave(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                onClick={() => {
                  handleSubmit(false);
                  setConfirmSave(false);
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {confirmDelete && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" 
            onClick={() => setConfirmDelete(false)} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Excluir Porta</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir esta porta? Esta ação não poderá ser desfeita.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
                onClick={() => {
                  fetchNui('deleteDoor', useStore.getState().id);
                  navigate('/');
                  setConfirmDelete(false);
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Submit;
