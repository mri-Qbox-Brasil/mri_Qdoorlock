import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MriPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon: LucideIcon
  count?: number
  countLabel?: string
  children?: React.ReactNode
}

export function MriPageHeader({ title, icon: Icon, count, countLabel, children, className, ...props }: MriPageHeaderProps) {
  return (
    <div className={cn("w-full h-auto min-h-[5rem] border-b border-border flex items-center justify-between py-4 px-6 bg-card/30 shrink-0", className)} {...props}>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
            </div>
            {count !== undefined && (
                <div className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {count} {(countLabel || 'Records').toUpperCase()}
                </div>
            )}
        </div>

        <div className="flex items-center gap-3">
            {children}
        </div>
    </div>
  )
}
