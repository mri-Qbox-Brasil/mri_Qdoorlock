import { useState } from "react"
import { MriButton } from "@/components/atoms/MriButton"
import {
  MriPopover,
  MriPopoverContent,
  MriPopoverTrigger,
} from "@/components/molecules/MriPopover"
import {
  MriCommand,
  MriCommandEmpty,
  MriCommandGroup,
  MriCommandInput,
  MriCommandItem,
  MriCommandList,
} from "@/components/molecules/MriCommand"
import { Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  label: string
  value: string | number
}

interface MriCompactSearchProps {
  options: Option[]
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  size?: "default" | "sm"
  error?: boolean | string
  clearable?: boolean
  portal?: boolean
}

export function MriCompactSearch({
  options,
  value,
  onChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled,
  size = "default",
  error,
  clearable = false,
  portal = true
}: MriCompactSearchProps) {
  const [open, setOpen] = useState(false)

  return (
    <MriPopover open={open} onOpenChange={setOpen}>
      <MriPopoverTrigger asChild>
        <div className="flex flex-col gap-1 items-center">
          <MriButton
            variant="ghost"
            size={size === "sm" ? "sm" : "icon"}
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              "aspect-square p-0 border rounded-md bg-background/50 backdrop-blur-sm hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm",
              error ? "border-destructive text-destructive" : "border-input",
              size === "default" && "!h-[42px] !w-[42px]",
              size === "sm" && "!h-8 !w-8",
              className
            )}
          >
            <Search className="h-4 w-4" />
          </MriButton>
          {typeof error === "string" && (
            <p className="text-[10px] font-medium text-destructive animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
              {error}
            </p>
          )}
        </div>
      </MriPopoverTrigger>
      <MriPopoverContent portal={portal} className="w-[200px] p-0 border-border bg-popover" align="start">
        <MriCommand className="bg-transparent">
          <MriCommandInput placeholder={searchPlaceholder} className="h-9" />
          <MriCommandEmpty>{emptyMessage}</MriCommandEmpty>
          <MriCommandList 
            className="max-h-60 overflow-auto p-1 custom-scrollbar"
            onWheel={(e) => e.stopPropagation()}
          >
            <MriCommandGroup>
              {options.map((opt) => (
                <MriCommandItem
                  key={opt.value}
                  value={String(opt.label || '')}
                  onSelect={() => {
                    const newValue = String(opt.value)
                    if (clearable && String(value) === newValue) {
                      onChange("")
                    } else {
                      onChange(newValue)
                    }
                    setOpen(false)
                  }}
                  className="aria-selected:bg-accent aria-selected:text-accent-foreground rounded-md cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      String(value) === String(opt.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </MriCommandItem>
              ))}
            </MriCommandGroup>
          </MriCommandList>
        </MriCommand>
      </MriPopoverContent>
    </MriPopover>
  )
}
