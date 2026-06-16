import * as React from 'react'
import { cn } from '../../lib/utils'

export interface MriInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'default' | 'sm'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean | string
}

export const MriInput = React.forwardRef<HTMLInputElement, MriInputProps>(
  ({ className, size = 'default', leftIcon, rightIcon, error, ...props }, ref) => {
    const hasError = !!error
    const errorMessage = typeof error === 'string' ? error : null

    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none [&>svg]:size-4">
              {leftIcon}
            </div>
          )}
          <input
            {...props}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-background/50 text-foreground focus:border-ring focus:outline-none placeholder:text-muted-foreground transition-colors disabled:opacity-50',
              size === 'default' ? 'h-9 text-sm' : 'h-8 text-xs',
              leftIcon ? 'pl-9' : 'px-3',
              rightIcon ? 'pr-9' : 'px-3',
              hasError ? 'border-destructive focus:border-destructive' : 'border-input',
              className
            )}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none [&>svg]:size-4">
              {rightIcon}
            </div>
          )}
        </div>
        {errorMessage && (
          <p className="text-[10px] font-medium text-destructive px-1 animate-in fade-in slide-in-from-top-1">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
MriInput.displayName = 'MriInput'
