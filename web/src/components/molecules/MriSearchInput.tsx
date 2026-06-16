import { Search } from 'lucide-react'
import { MriInput } from '@/components/atoms/MriInput'
import { cn } from '@/lib/utils'

export interface MriSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  width?: string
  size?: "default" | "sm"
  error?: boolean | string
}

export function MriSearchInput({
  value,
  onChange,
  placeholder,
  className,
  width = "w-80",
  size = "default",
  error
}: MriSearchInputProps) {
  return (
    <div className={cn("relative", width, className)}>
        <Search className={cn("absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none z-10", size === "sm" && "top-2")} />
        <MriInput
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size={size}
            error={error}
            className={cn("pl-9 bg-card border-border focus:border-primary/50 w-full transition-colors", size === "default" && "h-10")}
        />
    </div>
  )
}
