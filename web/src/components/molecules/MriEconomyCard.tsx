import { MriButton } from "@/components/atoms/MriButton"
import { Plus, Minus, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export interface MriEconomyCardProps {
  label: string
  amount: number | string
  amountColorClass?: string
  onAdd?: () => void
  onRemove?: () => void
  disableAdd?: boolean
  disableRemove?: boolean
  defaultVisible?: boolean
}

export function MriEconomyCard({
  label,
  amount,
  amountColorClass = "text-foreground",
  onAdd,
  onRemove,
  disableAdd = false,
  disableRemove = false,
  defaultVisible = true,
}: MriEconomyCardProps) {
  const [visible, setVisible] = useState(defaultVisible)

  return (
    <div className="bg-card border border-border p-4 rounded-lg flex items-center justify-between">
      <div>
        <div className="text-xs text-muted-foreground font-bold uppercase">{label}</div>
        <div className={cn("text-xl font-bold font-mono", amountColorClass)}>
          {visible ? amount : "••••••"}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {(onAdd !== undefined || onRemove !== undefined) && (
          <div className="flex items-center gap-1">
            {onAdd !== undefined && (
              <MriButton
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded bg-muted hover:bg-muted/80"
                onClick={onAdd}
                disabled={disableAdd}
              >
                <Plus className="w-3.5 h-3.5" />
              </MriButton>
            )}
            {onRemove !== undefined && (
              <MriButton
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded bg-muted hover:bg-muted/80"
                onClick={onRemove}
                disabled={disableRemove}
              >
                <Minus className="w-3.5 h-3.5" />
              </MriButton>
            )}
          </div>
        )}
        <MriButton
          size="icon"
          variant="ghost"
          className="h-7 w-7 rounded bg-muted hover:bg-muted/80"
          onClick={() => setVisible(v => !v)}
        >
          {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </MriButton>
      </div>
    </div>
  )
}
