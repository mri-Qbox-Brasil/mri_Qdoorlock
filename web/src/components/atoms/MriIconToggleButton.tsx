import * as React from 'react'
import { ElementType } from 'react'
import { cn } from '@/lib/utils'

export type MriIconToggleButtonVariant = 'primary' | 'destructive'
export type MriIconToggleButtonSize = 'sm' | 'default'

export interface MriIconToggleButtonProps {
    /** Estado on/off. */
    active: boolean
    onClick: () => void
    /** Icone lucide (ou qualquer ElementType de svg). */
    icon: ElementType
    /** Tooltip nativo via `title`. */
    title?: string
    /** Cor do estado ativo. Default `primary`. `destructive` pra toggles "perigosos" (ex: muteCategory). */
    variant?: MriIconToggleButtonVariant
    /** Tamanho. `sm` (28px) ou `default` (36px). */
    size?: MriIconToggleButtonSize
    disabled?: boolean
    className?: string
}

/**
 * Botao toggle com icone — UI compacta pra ligar/desligar uma opcao.
 * Diferente de `MriSwitch` (que e label+switch horizontal): este e um
 * quadrado com icone que muda de cor quando ativo. Util em filtros, tabelas
 * com colunas toggle, configuracoes densas.
 *
 * Estados:
 * - active=true (variant=primary): fundo primary/15, icone primary
 * - active=true (variant=destructive): fundo destructive/15, icone destructive
 * - active=false: muted background no hover, icone esmaecido
 * - disabled: opacidade 40%, sem hover
 *
 * ```tsx
 * <MriIconToggleButton
 *   active={cat.enabled}
 *   onClick={() => toggle(cat.id)}
 *   icon={Database}
 *   title="Salvar no DB"
 * />
 * ```
 */
export const MriIconToggleButton: React.FC<MriIconToggleButtonProps> = ({
    active,
    onClick,
    icon: Icon,
    title,
    variant = 'primary',
    size = 'sm',
    disabled,
    className,
}) => {
    const sizeClasses = size === 'sm'
        ? 'w-7 h-7 [&>svg]:w-3.5 [&>svg]:h-3.5'
        : 'w-9 h-9 [&>svg]:w-4 [&>svg]:h-4'

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            title={title}
            aria-pressed={active}
            className={cn(
                'flex items-center justify-center rounded transition-colors',
                sizeClasses,
                disabled && 'opacity-40 cursor-not-allowed',
                !disabled && active && variant === 'primary' && 'bg-primary/15 text-primary hover:bg-primary/25',
                !disabled && active && variant === 'destructive' && 'bg-destructive/15 text-destructive hover:bg-destructive/25',
                !disabled && !active && 'text-muted-foreground/30 hover:bg-muted hover:text-muted-foreground',
                className
            )}
        >
            <Icon />
        </button>
    )
}
