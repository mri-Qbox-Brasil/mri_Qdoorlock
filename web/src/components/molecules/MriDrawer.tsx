import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const MriDrawer = DialogPrimitive.Root

const MriDrawerTrigger = DialogPrimitive.Trigger

const MriDrawerPortal = DialogPrimitive.Portal

const MriDrawerClose = DialogPrimitive.Close

const MriDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
MriDrawerOverlay.displayName = DialogPrimitive.Overlay.displayName

export type MriDrawerSide = "top" | "bottom" | "left" | "right"

interface MriDrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * Lado da tela de onde o drawer desliza. Default: `bottom` (mobile-style
   * action sheet). Use `right` pra painel lateral de detalhes/formulario,
   * `left` pra menu hamburger, `top` pra notificacoes.
   */
  side?: MriDrawerSide
  /**
   * Esconde o handle (barra horizontal) no topo do drawer bottom. Sem efeito
   * em outros lados. Default: false.
   */
  hideHandle?: boolean
}

// Classes de posicao + animacao por lado. Cada lado tem:
// - position: `fixed inset-x/y-0 [side]-0`
// - size: largura/altura caps no lado oposto da abertura
// - radius: cantos arredondados no lado interno
// - animation: slide-in/out na direcao correta
const SIDE_CLASSES: Record<MriDrawerSide, string> = {
  bottom:
    "fixed inset-x-0 bottom-0 mt-24 h-auto max-h-[90vh] rounded-t-[10px] border-t border-x " +
    "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  top:
    "fixed inset-x-0 top-0 mb-24 h-auto max-h-[90vh] rounded-b-[10px] border-b border-x " +
    "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
  right:
    "fixed inset-y-0 right-0 h-full w-full max-w-2xl rounded-l-[10px] border-l border-y " +
    "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  left:
    "fixed inset-y-0 left-0 h-full w-full max-w-2xl rounded-r-[10px] border-r border-y " +
    "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
}

const MriDrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  MriDrawerContentProps
>(({ className, children, side = "bottom", hideHandle = false, ...props }, ref) => (
  <MriDrawerPortal>
    <MriDrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 flex flex-col border-border bg-card shadow-2xl transition-transform duration-300",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        SIDE_CLASSES[side],
        className
      )}
      {...props}
    >
      {/* Handle bar — so faz sentido em side=bottom (action sheet mobile) */}
      {side === "bottom" && !hideHandle && (
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted shrink-0" />
      )}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          // Padding maior em bottom (action sheet) vs side drawers (que
          // geralmente tem header proprio com padding customizado)
          side === "bottom" ? "p-6 pt-2" : "p-0"
        )}
      >
        {children}
      </div>
      <MriDrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </MriDrawerClose>
    </DialogPrimitive.Content>
  </MriDrawerPortal>
))
MriDrawerContent.displayName = "MriDrawerContent"

const MriDrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
MriDrawerHeader.displayName = "MriDrawerHeader"

const MriDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
MriDrawerFooter.displayName = "MriDrawerFooter"

const MriDrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
MriDrawerTitle.displayName = DialogPrimitive.Title.displayName

const MriDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
MriDrawerDescription.displayName = DialogPrimitive.Description.displayName

export {
  MriDrawer,
  MriDrawerPortal,
  MriDrawerOverlay,
  MriDrawerTrigger,
  MriDrawerClose,
  MriDrawerContent,
  MriDrawerHeader,
  MriDrawerFooter,
  MriDrawerTitle,
  MriDrawerDescription,
}
