import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface MriTabsItem {
    label: string
    route: string
    icon?: ElementType
    /** Badge opcional na direita (count, status, etc). */
    badge?: ReactNode
    /** Desabilita o tab — mostra mas nao clicavel. */
    disabled?: boolean
}

export interface MriTabsProps {
    items: MriTabsItem[]
    activeRoute?: string
    onNavigate?: (route: string) => void
    /** Conteudo extra alinhado a direita do tab strip (ex: action button). */
    rightContent?: ReactNode
    className?: string
}

/**
 * Sub-navegacao horizontal pra dividir uma pagina em abas. Uso tipico:
 * pagina de admin com varias seccoes que nao merecem item proprio no
 * sidebar do app. Funciona standalone OU dentro de iframe embedded — nao
 * conflita com o sidebar do host.
 *
 * Visual: linha de tabs com underline animado no ativo (estilo
 * GitHub/Linear/Stripe). Light weight — sem bg-card, sem h-16, so border-b.
 *
 * ```tsx
 * <MriTabs
 *   items={[
 *     { label: 'Spawns', icon: MapPin, route: 'spawns' },
 *     { label: 'Settings', icon: Settings, route: 'config' },
 *   ]}
 *   activeRoute={route}
 *   onNavigate={setRoute}
 * />
 * ```
 */
export function MriTabs({
    items,
    activeRoute,
    onNavigate,
    rightContent,
    className,
}: MriTabsProps) {
    return (
        <div
            className={cn(
                'flex items-center border-b border-border',
                className
            )}
        >
            <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeRoute === item.route
                    return (
                        <button
                            key={item.route}
                            type="button"
                            disabled={item.disabled}
                            onClick={() => {
                                if (item.disabled) return
                                if (onNavigate) onNavigate(item.route)
                            }}
                            className={cn(
                                'group relative flex items-center gap-2 h-10 px-4 text-sm font-medium transition-colors',
                                // border-b-2 reservado pra todos (evita layout shift); transparent quando inativo
                                'border-b-2 border-transparent -mb-px',
                                item.disabled && 'opacity-40 cursor-not-allowed',
                                !item.disabled && (isActive
                                    ? 'text-primary border-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')
                            )}
                        >
                            {Icon && <Icon className="w-4 h-4 shrink-0" />}
                            <span>{item.label}</span>
                            {item.badge !== undefined && (
                                <span className="ml-1">{item.badge}</span>
                            )}
                        </button>
                    )
                })}
            </div>

            {rightContent && (
                <div className="flex items-center gap-2 shrink-0 px-2">
                    {rightContent}
                </div>
            )}
        </div>
    )
}
