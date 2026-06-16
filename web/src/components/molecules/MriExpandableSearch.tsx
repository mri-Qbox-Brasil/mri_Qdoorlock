import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MriExpandableSearchProps {
    value: string
    onChange: (val: string) => void
    placeholder?: string
    /** Largura quando expandido. Default: `w-64` (256px). */
    expandedWidth?: string
    className?: string
}

/**
 * Search bar compacta — inicialmente colapsada como botao de icone (40x40),
 * expande ao clicar e foca o input. Auto-colapsa no blur se o valor estiver
 * vazio. ESC blura e colapsa.
 *
 * Util em headers de paginas admin onde a busca e secundaria — economiza
 * espaco horizontal vs uma search bar sempre expandida.
 *
 * ```tsx
 * const [query, setQuery] = useState('')
 * <MriExpandableSearch
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Buscar jogador..."
 * />
 * ```
 */
export const MriExpandableSearch: React.FC<MriExpandableSearchProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    expandedWidth = 'w-64',
    className,
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sincroniza estado: se o parent setar value externamente (ex: filtro
    // pre-populado via URL), expande pra refletir.
    useEffect(() => {
        if (value && value.trim().length > 0) {
            const timer = setTimeout(() => setIsExpanded(true), 0)
            return () => clearTimeout(timer)
        }
    }, [value])

    const handleToggle = () => {
        if (!isExpanded) {
            setIsExpanded(true)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
        inputRef.current?.focus()
    }

    return (
        <div className={cn(
            'relative flex items-center transition-all duration-300 ease-in-out group h-10',
            isExpanded ? expandedWidth : 'w-10',
            className
        )}>
            <div
                onClick={handleToggle}
                className={cn(
                    'flex items-center w-full h-full rounded-lg border transition-all duration-300 cursor-text',
                    isExpanded
                        ? 'pl-3 pr-2 bg-card/60 border-primary/40 ring-1 ring-primary/40 shadow-[0_0_10px_hsl(var(--primary)/0.1)]'
                        : 'justify-center bg-transparent border-input hover:bg-muted cursor-pointer'
                )}
            >
                <div className={cn(
                    'flex items-center justify-center shrink-0 transition-all duration-300',
                    isExpanded ? 'w-4' : 'w-full h-full'
                )}>
                    <Search className={cn(
                        'w-4 h-4 transition-all duration-300',
                        isExpanded ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )} />
                </div>

                {isExpanded && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-full bg-transparent border-none outline-none text-[13px] px-2 text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 focus:ring-0 animate-in fade-in zoom-in-95 duration-200"
                        onBlur={() => { if (!value) setIsExpanded(false) }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                inputRef.current?.blur()
                                if (!value) setIsExpanded(false)
                            }
                        }}
                    />
                )}

                {isExpanded && value && (
                    <button
                        onClick={handleClear}
                        className="p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                        title="Clear"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}
