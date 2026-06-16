import { cn } from '@/lib/utils'

export interface MriStatusBadgeProps {
    label: string | number
    variant?: 'default' | 'destructive' | 'warning' | 'success' | 'outline' | 'ghost'
    className?: string
    size?: 'xs' | 'sm' | 'md'
}

export function MriStatusBadge({
    label,
    variant = 'default',
    className,
    size = 'xs'
}: MriStatusBadgeProps) {
    return (
        <span className={cn(
            "font-semibold rounded-md border flex items-center justify-center font-mono whitespace-nowrap transition-all duration-200",
            size === 'xs' && "px-1.5 py-0.5 text-[9px] uppercase tracking-wider",
            size === 'sm' && "px-2 py-0.5 text-[10px] uppercase tracking-wider",
            size === 'md' && "px-3 py-1 text-xs uppercase tracking-widest",

            variant === 'default' && "bg-muted/50 text-muted-foreground border-border/50",
            variant === 'outline' && "bg-transparent text-foreground border-border",
            variant === 'ghost' && "bg-black/40 text-zinc-400 border-white/5 backdrop-blur-sm",
            variant === 'destructive' && "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
            variant === 'warning' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
            variant === 'success' && "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]",
            className
        )}>
            {label}
        </span>
    )
}
