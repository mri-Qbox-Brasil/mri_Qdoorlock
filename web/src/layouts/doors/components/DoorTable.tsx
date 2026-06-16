import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '../../../store/search';
import { useDoors, type DoorColumn } from '../../../store/doors';
import ActionsMenu from './ActionsMenu';

const DoorTable: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const globalFilter = useSearch((state) => state.debouncedValue);
  const data = useDoors((state) => state.doors);

  const table = useReactTable({
    data,
    columns: [
      { accessorKey: 'id', id: 'id' },
      { accessorKey: 'name', id: 'name' },
      { accessorKey: 'zone', id: 'zone' },
    ],
    initialState: {
      pagination: { pageSize: 6, pageIndex: 0 },
    },
    state: { sorting, globalFilter },
    onGlobalFilterChange: useSearch((state) => state.setValue),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(currentPage - 1);
  }, [currentPage, data]);

  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col justify-between flex-1 overflow-hidden p-6 bg-background">
      {rows.length > 0 ? (
        <div className="overflow-auto flex-1 space-y-3 pr-2 custom-scrollbar">
          {rows.map((row) => {
            const door = row.original as DoorColumn;
            return (
              <div
                key={row.id}
                className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:border-primary/50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${door.state ? 'bg-destructive' : 'bg-primary'} shadow-[0_0_8px_currentColor]`} />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm tracking-wide">{door.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ID: {door.id} {door.zone ? `• Zona: ${door.zone}` : ''}
                    </span>
                  </div>
                </div>
                <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                  {/* Pass the row to ActionsMenu by wrapping it in a fake cell context to avoid rewriting ActionsMenu completely right now, or we can just adapt ActionsMenu to take 'door' */}
                  <ActionsMenu data={{ row } as any} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <Search size={40} className="opacity-30" />
          <p className="text-sm">Nenhum resultado encontrado</p>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border/50 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all ${
                page === currentPage
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border/50 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default DoorTable;
