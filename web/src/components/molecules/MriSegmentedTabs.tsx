import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface MriSegmentedTabsItem {
    id: string
    label: string | React.ReactNode
    icon?: LucideIcon | React.ElementType
    /** Classe extra so neste item. */
    className?: string
}

export type MriSegmentedTabsType = 'single' | 'multiple'
export type MriSegmentedTabsVariant = 'default' | 'premium'

type SingleProps = {
    type?: 'single'
    value: string
    onChange: (id: string) => void
}

type MultipleProps = {
    type: 'multiple'
    value: string[]
    onChange: (ids: string[]) => void
}

type CommonProps = {
    items: MriSegmentedTabsItem[]
    /** `default` = rounded-lg; `premium` = rounded-xl com cantos mais arredondados. */
    variant?: MriSegmentedTabsVariant
    className?: string
    itemClassName?: string
}

export type MriSegmentedTabsProps = CommonProps & (SingleProps | MultipleProps)

/**
 * Segmented control — grupo de botoes lado-a-lado dentro de uma caixinha
 * compartilhada. Diferente de `MriTabs` (que e underline pra navegacao de
 * pagina), este e mais compacto e bom pra:
 * - Filtros chip-style (`type="multiple"`)
 * - Toggles de view (lista/grid, all/online/offline)
 * - Sub-categorias densas
 *
 * ```tsx
 * // Single (default) — picker de view
 * <MriSegmentedTabs
 *   items={[{ id: 'all', label: 'All' }, { id: 'online', label: 'Online' }]}
 *   value={view}
 *   onChange={setView}
 * />
 *
 * // Multiple — filtros chip
 * <MriSegmentedTabs
 *   type="multiple"
 *   items={categories}
 *   value={selectedIds}
 *   onChange={setSelectedIds}
 * />
 * ```
 */
export function MriSegmentedTabs(props: MriSegmentedTabsProps) {
    const { items, variant = 'default', className, itemClassName } = props
    const type: MriSegmentedTabsType = props.type === 'multiple' ? 'multiple' : 'single'

    const isSelected = (id: string): boolean => {
        if (type === 'multiple') return Array.isArray(props.value) && props.value.includes(id)
        return props.value === id
    }

    const handleClick = (id: string) => {
        if (type === 'multiple') {
            const current = Array.isArray(props.value) ? [...props.value] : []
            const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
                ; (props.onChange as (ids: string[]) => void)(next)
        } else {
            ; (props.onChange as (id: string) => void)(id)
        }
    }

    return (
        <div
            className={cn(
                'flex gap-1 p-1 border border-border backdrop-blur-sm shadow-inner transition-all shrink-0',
                variant === 'premium' ? 'bg-muted/50 rounded-xl' : 'bg-muted rounded-lg',
                className
            )}
        >
            {items.map((item) => {
                const active = isSelected(item.id)
                const Icon = item.icon
                return (
                    <button
                        key={item.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleClick(item.id)}
                        className={cn(
                            'px-2 py-1.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 flex-1 min-w-0',
                            variant === 'premium' ? 'rounded-lg' : 'rounded-md',
                            // Single = "tab" (sutil)
                            type === 'single' && (
                                active
                                    ? 'bg-background text-primary shadow-sm ring-1 ring-border/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            ),
                            // Multiple = "filter chip" (preenchido com primary)
                            type === 'multiple' && (
                                active
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            ),
                            itemClassName,
                            item.className
                        )}
                    >
                        {Icon && (
                            <Icon
                                className={cn(
                                    'w-3.5 h-3.5 shrink-0',
                                    active && type === 'multiple' ? 'text-primary-foreground' : ''
                                )}
                            />
                        )}
                        <span className="truncate pr-0.5">{item.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
