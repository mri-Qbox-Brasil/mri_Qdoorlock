import { useState, useMemo } from 'react';
import { StringField, useSetters, useStore } from '../../../../../store';

interface Props {
  setModal: React.Dispatch<React.SetStateAction<{ opened: boolean; index: number }>>;
  modal: { opened: boolean; index: number };
}

const ItemsModal: React.FC<Props> = ({ modal, setModal }) => {
  const itemFields = useStore((state) => state.items);
  const setItemFields = useSetters((setter) => setter.setItems);

  const itemData = useMemo(() => itemFields[modal.index], [modal, itemFields]);

  const [metadata, setMetadata] = useState<StringField>(itemData.metadata ?? null);
  const [remove, setRemove] = useState<boolean | null>(itemData.remove ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModal((s) => ({ ...s, opened: false }));
    setItemFields((prevState) =>
      prevState.map((item, index) =>
        index === modal.index ? { ...item, metadata, remove } : item
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Metadata (type)</label>
        <input
          className="h-8 px-3 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          value={(metadata as string) || ''}
          onChange={(e) => setMetadata(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30">
        <span className="text-xs font-medium text-foreground">Remover ao utilizar a porta</span>
        <button
          type="button"
          role="switch"
          aria-checked={!!remove}
          onClick={() => setRemove((v) => !v)}
          className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors ${remove ? 'bg-primary' : 'bg-muted'}`}
        >
          <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${remove ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>
      <button type="submit" className="w-full h-8 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
        Confirmar
      </button>
    </form>
  );
};

export default ItemsModal;
