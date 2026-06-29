import { useState } from 'react';
import { Trash2, Settings } from 'lucide-react';
import { useSetters, useStore } from '../../../../../store';
import DifficultyModal from '../../characters/components/DifficultyModal';
import { MriSelect } from '../../../../../components/molecules/MriSelect';

const selectData: { label: string; value: string }[] = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Médio', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
  { label: 'Personalizado', value: 'custom' },
];

const LockpickFields: React.FC = () => {
  const lockpickFields = useStore((state) => state.lockpickDifficulty);
  const setLockpickFields = useSetters((setter) => setter.setLockpickDifficulty);
  const [modal, setModal] = useState<{ opened: boolean; index: number }>({ opened: false, index: 0 });

  const handleRowDelete = (index: number) => {
    setLockpickFields((prevState) => prevState.filter((_obj, indx) => indx !== index));
  };

  return (
    <div className="space-y-2">
      {lockpickFields.map((field, index) => (
        <div key={`${typeof field === 'string' ? field : field?.areaSize}-${index}`} className="flex items-center gap-2">
          <MriSelect
            options={selectData}
            value={typeof field === 'string' ? field : 'custom'}
            onChange={() => {}}
            disabled
            className="flex-1"
          />
          <button
            title="Editar linha"
            onClick={() => setModal({ opened: true, index })}
            className="flex items-center justify-center w-8 h-8 rounded-md text-primary hover:bg-primary/10 transition-colors shrink-0"
          >
            <Settings size={15} />
          </button>
          <button
            title="Deletar linha"
            onClick={() => handleRowDelete(index)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {modal.opened && (
        <>
          <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={() => setModal({ ...modal, opened: false })} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-64 bg-card border border-border rounded-xl shadow-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Dificuldade da Lockpick</h3>
            <DifficultyModal selectData={selectData} setModal={setModal} modal={modal} />
          </div>
        </>
      )}
    </div>
  );
};

export default LockpickFields;
