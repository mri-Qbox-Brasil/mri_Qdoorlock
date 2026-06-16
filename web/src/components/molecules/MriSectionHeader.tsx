import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface MriSectionHeaderProps {
  icon: LucideIcon
  title: string
  className?: string
}

export function MriSectionHeader({ icon: Icon, title, className }: MriSectionHeaderProps) {
  return (
    <h3 className={cn("text-muted-foreground text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2", className)}>
      <Icon className="w-3.5 h-3.5" /> {title}
    </h3>
  )
}
