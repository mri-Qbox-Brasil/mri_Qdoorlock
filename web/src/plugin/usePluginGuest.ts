import { useCallback, useEffect, useRef } from 'react'
import {
  isMriPluginMessage,
  MriPluginGuestMessage,
  MriPluginHostMessage,
} from './types'

function hexToHslString(hex: string): string {
  // Remove hash se existir
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function applyTheme(data: { accentColor?: string, backgroundColor?: string }) {
  if (data.accentColor) {
    const hsl = hexToHslString(data.accentColor)
    document.documentElement.style.setProperty('--primary', hsl)
    document.documentElement.style.setProperty('--ring', hsl)
  }
  if (data.backgroundColor) {
    const hsl = hexToHslString(data.backgroundColor)
    document.documentElement.style.setProperty('--background', hsl)
  }
}

export function usePluginGuest(handlers: {
  onInit?: (data: Extract<MriPluginHostMessage, { type: 'mri-plugin/init' }>) => void
  onThemeChanged?: (data: Extract<MriPluginHostMessage, { type: 'mri-plugin/theme-changed' }>) => void
  onPermsChanged?: (data: Extract<MriPluginHostMessage, { type: 'mri-plugin/perms-changed' }>) => void
  onClose?: () => void
}) {
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isMriPluginMessage(event.data)) return
      // We only accept messages from the parent window
      if (event.source !== window.parent) return

      const msg = event.data as MriPluginHostMessage
      switch (msg.type) {
        case 'mri-plugin/init':
          handlersRef.current.onInit?.(msg)
          break
        case 'mri-plugin/theme-changed':
          handlersRef.current.onThemeChanged?.(msg)
          break
        case 'mri-plugin/perms-changed':
          handlersRef.current.onPermsChanged?.(msg)
          break
        case 'mri-plugin/close':
          handlersRef.current.onClose?.()
          break
      }
    }
    
    window.addEventListener('message', onMessage)
    
    // Notify the host that we are ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'mri-plugin/ready' } as MriPluginGuestMessage, '*')
    }

    return () => window.removeEventListener('message', onMessage)
  }, [])

  const sendToHost = useCallback((msg: MriPluginGuestMessage) => {
    if (window.parent !== window) {
      window.parent.postMessage(msg, '*')
    }
  }, [])

  return sendToHost
}
