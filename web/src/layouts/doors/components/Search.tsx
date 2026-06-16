import { useEffect } from 'react';
import { Search } from 'lucide-react';
import useDebounce from '../../../hooks/useDebounce';
import { useSearch } from '../../../store/search';

const Searchbar: React.FC = () => {
  const search = useSearch();
  const debouncedSearch = useDebounce(search.value);

  useEffect(() => {
    search.setDebouncedValue(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        className="w-56 h-8 pl-8 pr-3 text-sm bg-muted/20 border border-border/50 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
        placeholder="Buscar porta..."
        value={search.value ?? ''}
        onChange={(e) => search.setValue(e.target.value)}
      />
    </div>
  );
};

export default Searchbar;
