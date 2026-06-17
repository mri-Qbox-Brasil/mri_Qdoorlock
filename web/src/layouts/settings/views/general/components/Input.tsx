import { HelpCircle } from 'lucide-react';

interface Props {
  label: string;
  type: 'text' | 'number';
  value?: string | number;
  setValue: (value: any) => void;
  tooltip?: string;
  disabled?: boolean;
  error?: string;
}

const Input: React.FC<Props> = ({ label, type, tooltip, value, setValue, disabled, error }) => {
  return (
    <div className={`flex flex-col gap-1 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {tooltip && (
          <div className="relative group">
            <HelpCircle size={12} className="text-muted-foreground/50 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-44 text-xs bg-popover border border-border rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-foreground">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <input
        type={type}
        value={value}
        disabled={disabled}
        step={type === 'number' ? 0.1 : undefined}
        onChange={(e) => setValue(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        className={`h-8 px-3 text-sm bg-muted/50 border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-border focus:ring-primary focus:border-primary'} rounded-md outline-none focus:ring-1 text-foreground placeholder:text-muted-foreground transition-all ${disabled ? 'cursor-not-allowed' : ''}`}
      />
      {error && <span className="text-[10px] text-red-500 -mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
