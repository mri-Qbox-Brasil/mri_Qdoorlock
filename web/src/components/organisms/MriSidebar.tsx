import { MriButton } from '@/components/atoms/MriButton'
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ElementType, ReactNode } from 'react'

export interface MriSidebarItem {
    label: string
    route?: string
    icon: ElementType
    onClick?: () => void
    divider?: boolean
}

export interface MriSidebarProps {
    items: MriSidebarItem[]
    activeRoute?: string
    onNavigate?: (route: string) => void
    collapsed?: boolean
    onToggleCollapse?: () => void
    footer?: ReactNode
    children?: ReactNode
    className?: string
}

export function MriSidebar({
    items,
    activeRoute,
    onNavigate,
    collapsed = false,
    onToggleCollapse,
    footer,
    children,
    className
}: MriSidebarProps) {

  const NavButton = ({ item }: { item: MriSidebarItem }) => {
      if (item.divider) {
          return <div className="my-2 border-b border-white/5 opacity-50" />
      }

      const Icon = item.icon
      const isActive = item.route && activeRoute === item.route

      return (
        <MriButton
          variant="ghost"
          className={cn(
              "w-full justify-start gap-3 relative transition-all duration-200 border",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-primary/10 text-primary border-primary/50 shadow-[inset_3px_0_0_0_var(--primary)]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
              className
          )}
          onClick={() => {
              if (item.onClick) item.onClick()
              if (item.route && onNavigate) onNavigate(item.route)
          }}
          title={collapsed ? item.label : undefined}
        >
          <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(0,227,150,0.5)]" : "")} />
          {!collapsed && <span className={cn("truncate font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>}

          {/* Active Glow for collapsed mode */}
          {collapsed && isActive && (
              <div className="absolute inset-0 bg-primary/10 rounded-md z-[-1]" />
          )}
        </MriButton>
      )
  }

  return (
    <div className={cn("h-full flex flex-col items-center py-4 border-border transition-all duration-300 bg-card", collapsed ? "w-16 px-2" : "w-60 px-3", className)}>
      <div className="flex-1 flex flex-col gap-1 w-full overflow-y-auto pr-1 no-scrollbar">
        {items.map((item, index) => (
            <NavButton key={index} item={item} />
        ))}
        {children}
      </div>

      <div className="mt-auto w-full flex flex-col gap-2 pt-4 border-t border-border">
        {footer}

        {onToggleCollapse && (
            <button
            onClick={onToggleCollapse}
            className={cn(
                "flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground w-full mt-2",
            )}
            >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
        )}
      </div>
    </div>
  )
}
