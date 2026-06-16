import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { mriBadgeVariants } from "./mri-badge-variants"

import { cn } from "@/lib/utils"

export interface MriBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mriBadgeVariants> {}

function MriBadge({ className, variant, ...props }: MriBadgeProps) {
  return (
    <div className={cn(mriBadgeVariants({ variant }), className)} {...props} />
  )
}

export { MriBadge }
