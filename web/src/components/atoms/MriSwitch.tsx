import * as React from 'react'
import { cn } from '@/lib/utils'

export interface MriSwitchProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
    /** Tamanho do switch — `sm` (w-7 h-4) ou `default` (w-9 h-5). */
    size?: 'sm' | 'default'
    /** Texto pra screen readers (recomendado quando o switch nao tem label visivel). */
    'aria-label'?: string
    className?: string
    id?: string
}

/**
 * Switch (toggle iOS-style). Wrapper sobre `<input type="checkbox">` com
 * styling Tailwind via `peer`. Sem dep extra — funciona com a a11y nativa
 * do checkbox HTML (screen readers anunciam estado via `aria-checked` que
 * o navegador deriva do `checked`).
 *
 * Uso controlado:
 * ```tsx
 * const [enabled, setEnabled] = useState(false)
 * <MriSwitch checked={enabled} onCheckedChange={setEnabled} aria-label="Modo debug"/>
 * ```
 */
export const MriSwitch = React.forwardRef<HTMLInputElement, MriSwitchProps>(
    ({ checked, onCheckedChange, disabled, size = 'default', className, id, ...rest }, ref) => {
        const sizeClasses = size === 'sm'
            ? 'w-7 h-4 after:h-3 after:w-3'
            : 'w-9 h-5 after:h-4 after:w-4'

        return (
            <label
                className={cn(
                    'relative inline-flex items-center shrink-0',
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    className
                )}
            >
                <input
                    ref={ref}
                    id={id}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onCheckedChange(e.target.checked)}
                    className="sr-only peer"
                    aria-label={rest['aria-label']}
                />
                <div
                    className={cn(
                        'rounded-full border border-border bg-muted transition-colors',
                        'peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 ring-offset-background',
                        // Knob (after pseudo-element)
                        'after:content-[""] after:absolute after:top-[2px] after:left-[2px]',
                        'after:bg-white after:rounded-full after:transition-transform',
                        'peer-checked:after:translate-x-full',
                        sizeClasses
                    )}
                />
            </label>
        )
    }
)

MriSwitch.displayName = 'MriSwitch'
