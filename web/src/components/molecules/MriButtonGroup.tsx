import React from 'react'
import { MriButton } from "../atoms/MriButton"

type Action = { icon?: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }

export default function MriButtonGroup({ buttons, disabled = false }: { buttons: Action[]; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((b, i) => {
        const isDisabled = disabled || b.disabled
        return (
          <MriButton key={i} onClick={isDisabled ? undefined : b.onClick} className="flex items-center gap-2" variant="secondary" disabled={isDisabled}>
            {b.icon}
            <span>{b.label}</span>
          </MriButton>
        )
      })}
    </div>
  )
}
