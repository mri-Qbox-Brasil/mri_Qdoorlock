import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  type: 'text' | 'number';
  value?: string | number;
  setValue: (value: any) => void;
  tooltip?: string;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<Props> = ({ label, type, tooltip, value, setValue, disabled, error, icon }) => {
  return (
    <div className={cn("flex flex-col gap-1.5", disabled && "opacity-60")}>
      <div className="flex items-center gap-1.5">
        {icon && <div className="text-muted-foreground/70">{icon}</div>}
        <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        {tooltip && (
          <div className="relative group">
            <HelpCircle size={12} className="text-muted-foreground/50 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-44 text-xs bg-popover border border-border rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-foreground">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type={type}
          value={value}
          disabled={disabled}
          step={type === 'number' ? 0.1 : undefined}
          onChange={(e) => setValue(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className={cn(
            "w-full h-9 px-3 text-sm bg-card/60 border rounded-lg outline-none transition-all duration-150",
            "text-foreground placeholder:text-muted-foreground/50",
            "hover:bg-card hover:border-border/60",
            error 
              ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" 
              : "border-border/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
            disabled && "cursor-not-allowed hover:bg-card/60 hover:border-border/30"
          )}
        />
      </div>
      {error && <span className="text-[11px] font-medium text-red-500/90 -mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
