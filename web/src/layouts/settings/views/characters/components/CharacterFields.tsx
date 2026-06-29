import { Trash2 } from 'lucide-react';
import { useStore, useSetters } from '../../../../../store';
import { useTranslation } from 'react-i18next';

const CharacterFields: React.FC = () => {
  const { t } = useTranslation();
  const characters = useStore((state) => state.characters);
  const setCharacters = useSetters((setter) => setter.setCharacters);

  const handleChange = (value: string | undefined, index: number) => {
    setCharacters((prevState) => prevState.map((item, indx) => (index === indx ? value : item)));
  };

  const handleRowDelete = (index: number) => {
    setCharacters((prevState) => prevState.filter((_obj, indx) => indx !== index));
  };

  return (
    <div className="space-y-2">
      {characters.map((field, index) => (
        <div key={`char-${index}`} className="flex items-center gap-2">
          <input
            className="flex-1 h-8 px-3 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
            placeholder="Citizen ID"
            value={field as string}
            onChange={(e) => handleChange(e.target.value, index)}
          />
          <button
            title={t('ui_delete_row_tooltip')}
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

export default CharacterFields;
