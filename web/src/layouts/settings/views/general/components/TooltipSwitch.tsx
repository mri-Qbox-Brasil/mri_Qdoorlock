import { cn } from '@/lib/utils';

interface Props {
  label: string;
  tooltip?: string;
  value: boolean;
  toggle: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const TooltipSwitch: React.FC<Props> = ({ label, value, toggle, disabled = false, icon, onMouseEnter, onMouseLeave }) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group flex items-center justify-between gap-2 p-3 rounded-xl border transition-all duration-150',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        value
          ? 'bg-primary/10 border-primary/40 shadow-sm shadow-primary/10'
          : 'bg-card/60 border-border/30 hover:bg-card hover:border-border/60'
      )}
      onClick={disabled ? undefined : (e) => {
        // Only toggle if they didn't click the switch directly, as the switch handles its own click
        const target = e.target as HTMLElement;
        if (!target.closest('button[role="switch"]')) {
          toggle();
        }
      }}
    >
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
            value ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground group-hover:text-foreground"
          )}>
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-sm font-medium transition-colors",
              value ? "text-primary" : "text-foreground"
            )}>
              {label}
            </span>
          </div>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={disabled ? undefined : toggle}
        className={`relative inline-flex h-5 w-9 shrink-0 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          value ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default TooltipSwitch;
