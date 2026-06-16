import { useState } from 'react';
import { Trash2, Settings } from 'lucide-react';
import { useSetters, useStore } from '../../../../../store';
import ItemsModal from './ItemsModal';

const ItemFields: React.FC = () => {
  const itemFields = useStore((state) => state.items);
  const setItemFields = useSetters((setter) => setter.setItems);
  const [modal, setModal] = useState<{ opened: boolean; index: number }>({ opened: false, index: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const items = [...itemFields];
    if (e.target.id === 'name') items[index].name = e.target.value;
    setItemFields(() => items);
  };

  const handleRowDelete = (index: number) => {
    setItemFields((prevState) => prevState.filter((_obj, indx) => indx !== index));
  };

  return (
    <div className="space-y-2">
      {itemFields.map((field, index) => (
        <div key={`item-field-${index}`} className="flex items-center gap-2">
          <input
            id="name"
            className="flex-1 h-8 px-3 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
            value={(field.name as string) || ''}
            placeholder="Item"
            onChange={(e) => handleChange(e, index)}
          />
          <button
            title="Opções de item"
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

      {/* Modal */}
      {modal.opened && (
        <>
          <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={() => setModal({ ...modal, opened: false })} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-64 bg-card border border-border rounded-xl shadow-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Opções de item</h3>
            <ItemsModal modal={modal} setModal={setModal} />
          </div>
        </>
      )}
    </div>
  );
};

export default ItemFields;
