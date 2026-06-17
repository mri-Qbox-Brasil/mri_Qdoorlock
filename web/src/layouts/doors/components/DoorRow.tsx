import { Lock, Unlock, MapPin, Check } from 'lucide-react';
import ActionsMenu from './ActionsMenu';
import { DoorColumn } from '../../../store/doors';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useSelection } from '../../../store/selection';

export const DoorRow = ({ door }: { door: DoorColumn }) => {
  const { isSelected, toggleSelection, selectedDoors } = useSelection();
  const selected = isSelected(door.id);
  const hasSelection = selectedDoors.length > 0;

  return (
    <div
      onClick={() => toggleSelection(door.id)}
      className={`flex items-center justify-between p-5 bg-card/40 border border-border/40 rounded-2xl transition-all duration-300 group shadow-sm hover:bg-card hover:border-primary/40 hover:shadow-lg cursor-pointer ${
        selected ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="mr-2 flex items-center justify-center">
          <Checkbox.Root
            className="flex h-5 w-5 appearance-none items-center justify-center rounded-md border border-primary/40 bg-background hover:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
            checked={selected}
            onCheckedChange={() => toggleSelection(door.id)}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox.Indicator className="text-primary-foreground">
              <Check size={14} strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
        </div>
        
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${
            door.state ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          } shadow-inner`}
        >
          {door.state ? <Lock size={18} /> : <Unlock size={18} />}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground text-base tracking-wide">{door.name}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                door.state
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
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

      <div className={`transition-opacity duration-300 ${hasSelection ? 'opacity-0 pointer-events-none' : ''}`} onClick={(e) => e.stopPropagation()}>
        <ActionsMenu door={door} />
      </div>
    </div>
  );
};
