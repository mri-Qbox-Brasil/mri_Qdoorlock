import * as React from 'react'
import { cn } from '../../lib/utils'

export interface MriTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean | string
    /** Hint visible abaixo do textarea (texto cinza, info contextual). */
    hint?: string
    /**
     * `auto` cresce com o conteudo (sem scrollbar interna). Default: `vertical`
     * (user-resizable). `none` trava o tamanho.
     */
    resize?: 'auto' | 'vertical' | 'none'
}

/**
 * Textarea estilizado consistente com `MriInput`. Mesmo border/focus/disabled,
 * apenas altura adaptavel. Pra single-line use `MriInput`.
 *
 * ```tsx
 * <MriTextarea
 *   value={text}
 *   onChange={(e) => setText(e.target.value)}
 *   rows={4}
 *   placeholder="Descreva a acao..."
 * />
 * ```
 */
export const MriTextarea = React.forwardRef<HTMLTextAreaElement, MriTextareaProps>(
    ({ className, error, hint, resize = 'vertical', onChange, ...props }, ref) => {
        const hasError = !!error
        const errorMessage = typeof error === 'string' ? error : null
        const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

        // Junta ref externo + interno (pra auto-resize precisar acessar)
        const setRefs = React.useCallback((el: HTMLTextAreaElement | null) => {
            innerRef.current = el
            if (typeof ref === 'function') ref(el)
            else if (ref) ref.current = el
        }, [ref])

        // Auto-resize: ajusta height baseado em scrollHeight a cada onChange.
        // Funciona controlled (precisa do onChange ser chamado) E uncontrolled.
        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (resize === 'auto' && innerRef.current) {
                innerRef.current.style.height = 'auto'
                innerRef.current.style.height = `${innerRef.current.scrollHeight}px`
            }
            onChange?.(e)
        }

        const resizeClass = {
            auto: 'resize-none overflow-hidden',
            vertical: 'resize-y',
            none: 'resize-none',
        }[resize]

        return (
            <div className="w-full space-y-1">
                <textarea
                    {...props}
                    ref={setRefs}
                    onChange={handleChange}
                    className={cn(
                        'w-full rounded-lg border bg-background/50 text-foreground text-sm px-3 py-2',
                        'focus:border-ring focus:outline-none placeholder:text-muted-foreground transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        resizeClass,
                        hasError ? 'border-destructive focus:border-destructive' : 'border-input',
                        className
                    )}
                />
                {(errorMessage || hint) && (
                    <p
                        className={cn(
                            'text-[10px] font-medium px-1',
                            errorMessage
                                ? 'text-destructive animate-in fade-in slide-in-from-top-1'
                                : 'text-muted-foreground'
                        )}
                    >
                        {errorMessage || hint}
                    </p>
                )}
            </div>
        )
    }
)

MriTextarea.displayName = 'MriTextarea'
