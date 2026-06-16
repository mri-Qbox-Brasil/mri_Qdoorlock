import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Search, Lock, Unlock, MapPin } from 'lucide-react';
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
                className="flex items-center justify-between p-5 bg-card/40 border border-border/40 rounded-2xl hover:bg-card hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${door.state ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'} shadow-inner`}>
                    {door.state ? <Lock size={18} /> : <Unlock size={18} />}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground text-base tracking-wide">{door.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${door.state ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                        {door.state ? 'Trancada' : 'Aberta'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="opacity-60">ID:</span>
                        <span className="text-foreground/80">{door.id}</span>
                      </span>
                      {door.zone && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="opacity-60" />
                            <span>{door.zone}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="transition-opacity duration-300">
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
