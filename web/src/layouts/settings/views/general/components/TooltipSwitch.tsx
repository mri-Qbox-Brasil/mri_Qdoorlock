import { HelpCircle } from 'lucide-react';

interface Props {
  label: string;
  tooltip?: string;
  value: boolean;
  toggle: () => void;
  disabled?: boolean;
}

const TooltipSwitch: React.FC<Props> = ({ tooltip, label, value, toggle, disabled = false }) => {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {tooltip && (
          <div className="relative group">
            <HelpCircle size={11} className="text-muted-foreground/50 cursor-help" />
            <div className="absolute bottom-full left-0 mb-1 w-44 text-xs bg-popover border border-border rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-foreground">
              {tooltip}
            </div>
          </div>
        )}
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
