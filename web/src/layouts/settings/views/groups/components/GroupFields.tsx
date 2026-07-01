import { Trash2 } from 'lucide-react';
import { useStore, useSetters } from '../../../../../store';

const GroupFields: React.FC = () => {
  const groups = useStore((state) => state.groups);
  const setGroups = useSetters((setter) => setter.setGroups);

  const handleChange = (value: string | number | undefined, index: number, property: 'name' | 'grade') => {
    setGroups((prevState) =>
      prevState.map((item, indx) => (index === indx ? { ...item, [property]: value } : item))
    );
  };

  const handleRowDelete = (index: number) => {
    setGroups((prevState) => prevState.filter((_obj, indx) => indx !== index));
  };

  return (
    <div className="space-y-2">
      {groups.map((field, index) => (
        <div key={`group-${index}`} className="flex items-center gap-2">
          <input
            className="flex-1 h-9 px-3 text-sm bg-card/60 border border-border/30 rounded-lg outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 hover:bg-card hover:border-border/60 transition-all"
            placeholder="Grupo (police, ballas, etc.)"
            value={field.name as string}
            onChange={(e) => handleChange(e.target.value, index, 'name')}
          />
          <input
            type="number"
            className="w-24 h-9 px-3 text-sm bg-card/60 border border-border/30 rounded-lg outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 hover:bg-card hover:border-border/60 transition-all"
            placeholder="Cargo"
            value={field.grade as number ?? ''}
            onChange={(e) => handleChange(parseInt(e.target.value), index, 'grade')}
          />
          <button
            title="Deletar linha"
            onClick={() => handleRowDelete(index)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default GroupFields;
