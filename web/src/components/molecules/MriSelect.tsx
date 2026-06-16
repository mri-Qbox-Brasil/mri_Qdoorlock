import { useState, useCallback } from "react"
import { Check, ChevronsUpDown, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MriButton } from "@/components/atoms/MriButton"
import { MriBadge } from "@/components/atoms/MriBadge"
import { MriPopover, MriPopoverContent, MriPopoverTrigger } from "@/components/molecules/MriPopover"
import {
  MriCommand,
  MriCommandEmpty,
  MriCommandGroup,
  MriCommandInput,
  MriCommandItem,
  MriCommandList,
} from "@/components/molecules/MriCommand"

export interface MriSelectOption {
  label: string
  value: string | number
  [key: string]: unknown
}

type MriSelectBase = {
  options: MriSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  isLoading?: boolean
  error?: boolean | string
  portal?: boolean
  size?: "default" | "sm"
  createLabelPrefix?: string
}

type MriSelectSingleProps = MriSelectBase & {
  multiple?: false
  value: string | number
  onChange: (value: string) => void
  clearable?: boolean
  creatable?: boolean
}

type MriSelectMultipleProps = MriSelectBase & {
  multiple: true
  value: (string | number)[]
  onChange: (value: (string | number)[]) => void
  maxVisibleValues?: number
}

export type MriSelectProps = MriSelectSingleProps | MriSelectMultipleProps

function MriSelectSingle({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled,
  isLoading = false,
  error,
  portal = true,
  size = "default",
  clearable = false,
  creatable = false,
  createLabelPrefix = "Create",
}: MriSelectSingleProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const selectedOption = options.find((o) => String(o.value) === String(value))

  const showCreateOption =
    creatable &&
    searchValue.trim() !== "" &&
    !options.some((o) => String(o.label).toLowerCase() === searchValue.toLowerCase())

  return (
    <MriPopover open={open} onOpenChange={setOpen}>
      <MriPopoverTrigger asChild>
        <div className="w-full space-y-1">
          <MriButton
            variant="outline"
            role="combobox"
            disabled={disabled || isLoading}
            isLoading={isLoading}
            aria-expanded={open}
            size={size}
            className={cn(
              "w-full justify-between bg-background border-border hover:bg-muted hover:text-foreground text-foreground",
              error && "border-destructive focus:ring-destructive",
              className
            )}
          >
            <span className="truncate">
              {selectedOption
                ? selectedOption.label
                : <span className="text-muted-foreground font-normal">{placeholder ?? "Select..."}</span>
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </MriButton>
          {typeof error === "string" && (
            <p className="text-[10px] font-medium text-destructive px-1 animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>
      </MriPopoverTrigger>
      <MriPopoverContent portal={portal} className="w-[--radix-popover-trigger-width] p-0 border-border bg-popover z-[100]">
        <MriCommand className="bg-transparent text-popover-foreground">
          <MriCommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <MriCommandEmpty>
            {showCreateOption ? (
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors px-4 py-2"
                onClick={() => { onChange(searchValue); setOpen(false); setSearchValue("") }}
              >
                <Plus className="w-4 h-4" />
                <span>{createLabelPrefix} "{searchValue}"</span>
              </div>
            ) : (
              <span>{emptyMessage}</span>
            )}
          </MriCommandEmpty>
          <MriCommandList
            className="max-h-60 overflow-auto p-1 custom-scrollbar"
            onWheel={(e) => e.stopPropagation()}
          >
            <MriCommandGroup>
              {options.map((opt) => (
                <MriCommandItem
                  key={opt.value}
                  value={`${String(opt.label)} ${String(opt.value)}`}
                  onSelect={() => {
                    const newValue = String(opt.value)
                    if (clearable && String(value) === newValue) {
                      onChange("")
                    } else {
                      onChange(newValue)
                    }
                    setOpen(false)
                    setSearchValue("")
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
              {showCreateOption && (
                <MriCommandItem
                  value={searchValue}
                  onSelect={() => { onChange(searchValue); setOpen(false); setSearchValue("") }}
                  className="text-primary font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createLabelPrefix} "{searchValue}"
                </MriCommandItem>
              )}
            </MriCommandGroup>
          </MriCommandList>
        </MriCommand>
      </MriPopoverContent>
    </MriPopover>
  )
}

function MriSelectMultiple({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled,
  isLoading = false,
  error,
  portal = true,
  maxVisibleValues = 3,
}: MriSelectMultipleProps) {
  const [open, setOpen] = useState(false)

  const handleToggle = useCallback((optValue: string | number) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }, [value, onChange])

  const selectedOptions = options.filter((o) => value.includes(o.value))

  return (
    <MriPopover open={open} onOpenChange={setOpen}>
      <MriPopoverTrigger asChild>
        <div className="w-full space-y-1">
          <MriButton
            variant="outline"
            role="combobox"
            disabled={disabled || isLoading}
            isLoading={isLoading}
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-background border-border hover:bg-muted hover:text-foreground text-foreground min-h-[40px] h-auto py-2",
              error && "border-destructive focus:ring-destructive",
              className
            )}
          >
            <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
              {selectedOptions.length > 0 ? (
                <>
                  {selectedOptions.slice(0, maxVisibleValues).map((opt) => (
                    <MriBadge
                      key={opt.value}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      <span className="truncate max-w-[100px]">{opt.label}</span>
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => { if (e.key === "Enter") handleToggle(opt.value) }}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                        onClick={() => handleToggle(opt.value)}
                      >
                        <X className="h-3 w-3 text-primary/60 hover:text-primary transition-colors" />
                      </button>
                    </MriBadge>
                  ))}
                  {selectedOptions.length > maxVisibleValues && (
                    <MriBadge variant="secondary" className="bg-muted text-muted-foreground border-border">
                      +{selectedOptions.length - maxVisibleValues}
                    </MriBadge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground font-normal">{placeholder ?? "Select options..."}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </MriButton>
          {typeof error === "string" && (
            <p className="text-[10px] font-medium text-destructive px-1 animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>
      </MriPopoverTrigger>
      <MriPopoverContent portal={portal} className="w-[--radix-popover-trigger-width] p-0 border-border bg-popover z-[100] shadow-2xl overflow-hidden rounded-xl">
        <MriCommand className="bg-transparent text-popover-foreground">
          <MriCommandInput placeholder={searchPlaceholder} className="h-10 border-none focus:ring-0 bg-transparent" />
          <MriCommandEmpty className="py-6 text-sm text-center text-muted-foreground">{emptyMessage}</MriCommandEmpty>
          <MriCommandList
            className="max-h-64 overflow-auto p-1.5 space-y-0.5 custom-scrollbar"
            onWheel={(e) => e.stopPropagation()}
          >
            <MriCommandGroup>
              {options.map((opt) => (
                <MriCommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => handleToggle(opt.value)}
                  className="aria-selected:bg-primary/10 aria-selected:text-primary rounded-lg cursor-pointer flex items-center justify-between py-2.5 px-3 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
                      value.includes(opt.value) ? "bg-primary border-primary" : "border-border bg-background"
                    )}>
                      {value.includes(opt.value) && <Check className="h-3 w-3 text-primary-foreground stroke-[3px]" />}
                    </div>
                    <span className={cn("text-sm font-medium", value.includes(opt.value) ? "text-primary" : "text-foreground")}>
                      {opt.label}
                    </span>
                  </div>
                </MriCommandItem>
              ))}
            </MriCommandGroup>
          </MriCommandList>
        </MriCommand>
      </MriPopoverContent>
    </MriPopover>
  )
}

export function MriSelect(props: MriSelectProps) {
  if (props.multiple === true) return <MriSelectMultiple {...props} />
  return <MriSelectSingle {...props} />
}
