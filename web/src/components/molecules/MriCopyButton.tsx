import { MriButton } from "@/components/atoms/MriButton"
import { Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MriCopyButtonProps {
  text: string
  className?: string
  iconSize?: number
  variant?: 'ghost' | 'outline' | 'default' | 'secondary' | 'link'
}

export function MriCopyButton({
  text,
  className,
  iconSize = 4,
  variant = 'ghost'
}: MriCopyButtonProps) {

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
  }

  return (
    <MriButton
      size="sm"
      variant={variant}
      className={cn("p-0 text-muted-foreground hover:text-foreground", className)}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      <Copy className={cn(`w-${iconSize} h-${iconSize}`)} />
    </MriButton>
  )
}
