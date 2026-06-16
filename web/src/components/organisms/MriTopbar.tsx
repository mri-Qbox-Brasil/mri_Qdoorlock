import { MriButton } from '@/components/atoms/MriButton'
import { cn } from '@/lib/utils'
import { ElementType, ReactNode } from 'react'

export interface MriTopbarItem {
    label: string
    route?: string
    icon: ElementType
    onClick?: () => void
    divider?: boolean
}

export interface MriTopbarProps {
    items: MriTopbarItem[]
    activeRoute?: string
    onNavigate?: (route: string) => void
    logo?: ReactNode
    rightContent?: ReactNode
    children?: ReactNode
    className?: string
}

export function MriTopbar({
    items,
    activeRoute,
    onNavigate,
    logo,
    rightContent,
    children,
    className
}: MriTopbarProps) {

  const NavButton = ({ item }: { item: MriTopbarItem }) => {
      if (item.divider) {
          return <div className="mx-2 border-l border-white/5 opacity-50 h-6 self-center" />
      }

      const Icon = item.icon
      const isActive = item.route && activeRoute === item.route

      return (
        <MriButton
          variant="ghost"
          className={cn(
              "h-10 justify-start gap-2 relative transition-all duration-200 border px-3",
              isActive
                ? "bg-primary/10 text-primary border-primary/50 shadow-[inset_0_-3px_0_0_var(--primary)]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
              className
          )}
          onClick={() => {
              if (item.onClick) item.onClick()
              if (item.route && onNavigate) onNavigate(item.route)
          }}
        >
          <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(0,227,150,0.5)]" : "")} />
          <span className={cn("truncate font-medium text-sm", isActive ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
        </MriButton>
      )
  }

  return (
    <div className={cn("w-full h-16 flex items-center px-4 border-b border-border bg-card gap-4", className)}>
      {logo && (
        <div className="flex items-center shrink-0 mr-2">
          {logo}
        </div>
      )}

      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {items.map((item, index) => (
            <NavButton key={index} item={item} />
        ))}
        {children}
      </div>

      {rightContent && (
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {rightContent}
        </div>
      )}
    </div>
  )
}
