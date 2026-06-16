import { useEffect, useMemo, useState } from "react"
import { Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MriInput } from "@/components/atoms/MriInput"
import { MriPopover, MriPopoverTrigger, MriPopoverContent } from "@/components/molecules/MriPopover"
import {
  type MarkerColor,
  type MarkerScale,
  type MarkerType,
  DEFAULT_MARKER_TYPES,
} from "./MriMarkerPicker.constants"
import {
  type FivemRefsIndex,
  DEFAULT_FIVEM_REFS_URL,
} from "./MriBlipPicker.constants"

const DEFAULT_CDN_BASE = "https://assets.mriqbox.com.br/"

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

export interface MriMarkerPickerProps {
  type: number
  color: MarkerColor
  scale: MarkerScale
  onChange: (val: { type: number; color: MarkerColor; scale: MarkerScale }) => void
  /** Lista customizada de marker types. Quando passada, evita fetch do índice.
   *  Quando omitida, o componente busca `markers` em `indexUrl` e mescla com
   *  os defaults (descrições + previews via `file`). */
  markerTypes?: MarkerType[]
  /** URL base do CDN para previews. O `file` do manifest é concatenado direto.
   *  Default: `https://assets.mriqbox.com.br/`. */
  cdnBase?: string
  /** URL do índice JSON. Default: o oficial em assets.mriqbox.com.br. */
  indexUrl?: string
  /** Inclui itens com `available: false` na lista. Default: false. */
  showUnavailable?: boolean
  /** Modo de scale. 'uniform' usa 1 input que aplica em x/y/z. 'xyz' permite editar separado. Default 'uniform'. */
  scaleMode?: "uniform" | "xyz"
  /** Modo compacto: renderiza um trigger pequeno (mini-preview do selecionado
   *  com a cor aplicada) que abre a UI completa num popover flutuante. */
  compact?: boolean
  /** Classe wrapper externa */
  className?: string
}

// ────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────

export function MriMarkerPicker(props: MriMarkerPickerProps) {
  if (props.compact) {
    return <MriMarkerPickerCompact {...props} />
  }
  return (
    <div className={cn("rounded-md border border-border bg-card p-3", props.className)}>
      <MarkerPickerBody {...props} />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Modo compacto — trigger + popover
// ────────────────────────────────────────────────────────────

function MriMarkerPickerCompact(props: MriMarkerPickerProps) {
  const {
    type, color, scale,
    cdnBase = DEFAULT_CDN_BASE,
    indexUrl = DEFAULT_FIVEM_REFS_URL,
    markerTypes: providedMarkerTypes,
    className,
  } = props

  const normalizedBase = cdnBase.endsWith("/") ? cdnBase : `${cdnBase}/`
  const merged = useMergedMarkers(providedMarkerTypes, indexUrl)
  const selected = merged.find(m => m.id === type)
  const colorCss = `rgba(${color.r}, ${color.g}, ${color.b}, ${(color.a / 255).toFixed(2)})`

  const [open, setOpen] = useState(false)

  return (
    <MriPopover open={open} onOpenChange={setOpen}>
      <MriPopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left transition-colors hover:bg-accent w-full",
            className
          )}
        >
          <MarkerPreview
            file={selected?.file}
            base={normalizedBase}
            color={color}
            className="w-7 h-7 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-muted-foreground">{String(type).padStart(2, "0")}</span>
              {selected && <span className="truncate">{selected.name}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm border border-border"
                style={{ backgroundColor: colorCss }}
              />
              <span className="font-mono">
                {color.r},{color.g},{color.b},{color.a}
              </span>
              <span>·</span>
              <span className="font-mono">
                {scale.x === scale.y && scale.y === scale.z
                  ? `${scale.x.toFixed(2)}x`
                  : `${scale.x.toFixed(1)}×${scale.y.toFixed(1)}×${scale.z.toFixed(1)}`}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        </button>
      </MriPopoverTrigger>
      <MriPopoverContent
        className="w-[640px] p-3 bg-card"
        align="start"
        sideOffset={6}
      >
        <MarkerPickerBody {...props} />
      </MriPopoverContent>
    </MriPopover>
  )
}

// ────────────────────────────────────────────────────────────
// Body — UI completa reutilizada inline e dentro do popover
// ────────────────────────────────────────────────────────────

function MarkerPickerBody({
  type,
  color,
  scale,
  onChange,
  markerTypes: providedMarkerTypes,
  cdnBase = DEFAULT_CDN_BASE,
  indexUrl = DEFAULT_FIVEM_REFS_URL,
  showUnavailable = false,
  scaleMode = "uniform",
}: MriMarkerPickerProps) {
  const normalizedBase = cdnBase.endsWith("/") ? cdnBase : `${cdnBase}/`
  const fetched = useMergedMarkers(providedMarkerTypes, indexUrl)

  const markerTypes = useMemo<MarkerType[]>(() => {
    const src = providedMarkerTypes ?? (fetched.length > 0 ? fetched : DEFAULT_MARKER_TYPES)
    return showUnavailable ? src : src.filter(m => m.available !== false)
  }, [providedMarkerTypes, fetched, showUnavailable])

  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return markerTypes
    const q = search.toLowerCase()
    return markerTypes.filter(m =>
      String(m.id).includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.description?.toLowerCase().includes(q) ?? false)
    )
  }, [markerTypes, search])

  const selected = markerTypes.find(m => m.id === type)
  const colorCss = `rgba(${color.r}, ${color.g}, ${color.b}, ${(color.a / 255).toFixed(2)})`

  const update = (patch: Partial<{ type: number; color: MarkerColor; scale: MarkerScale }>) => {
    onChange({
      type: patch.type ?? type,
      color: patch.color ?? color,
      scale: patch.scale ?? scale,
    })
  }

  const updateColor = (key: keyof MarkerColor, value: number) => {
    update({ color: { ...color, [key]: Math.max(0, Math.min(255, value | 0)) } })
  }

  const updateScale = (key: keyof MarkerScale, value: number) => {
    if (scaleMode === "uniform") {
      update({ scale: { x: value, y: value, z: value } })
    } else {
      update({ scale: { ...scale, [key]: value } })
    }
  }

  return (
    <div className="flex gap-3">
      {/* Coluna esquerda: lista de marker types */}
      <div className="flex flex-col gap-2 w-72 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          <MriInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tipo (ID ou nome)..."
            className="pl-7 text-xs"
          />
        </div>

        <div className="flex-1 max-h-72 overflow-y-auto rounded border border-border bg-background/30 divide-y divide-border/50">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
              Nenhum resultado
            </div>
          ) : (
            filtered.map(m => (
              <button
                key={m.id}
                onClick={() => update({ type: m.id })}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors",
                  m.id === type
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                )}
                title={m.description}
              >
                <MarkerPreview
                  file={m.file}
                  base={normalizedBase}
                  color={color}
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-[10px] font-mono text-muted-foreground w-6 flex-shrink-0">
                  {String(m.id).padStart(2, "0")}
                </span>
                <span className="text-xs truncate">{m.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Coluna direita: preview + cor + escala */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Preview */}
        <div className="rounded border border-border bg-background/30 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <MarkerPreview
              file={selected?.file}
              base={normalizedBase}
              color={color}
              className="w-24 h-24 rounded"
              imageStyle={{
                width: `${Math.min(scale.x * 32, 96)}px`,
                height: `${Math.min(scale.z * 32, 96)}px`,
              }}
              fallbackText={`Type ${type}`}
            />
            <div className="flex-1 min-w-0 space-y-1 text-xs">
              <p>
                <span className="text-muted-foreground">Tipo:</span>{" "}
                <span className="font-mono">{type}</span>
                {selected && <span className="text-muted-foreground"> · {selected.name}</span>}
              </p>
              {selected?.description && (
                <p className="text-[10px] text-muted-foreground">{selected.description}</p>
              )}
              <p>
                <span className="text-muted-foreground">Cor:</span>{" "}
                <span className="inline-block w-3 h-3 rounded-sm border border-border align-middle mr-1" style={{ backgroundColor: colorCss }} />
                <span className="font-mono">rgba({color.r}, {color.g}, {color.b}, {color.a})</span>
              </p>
              <p>
                <span className="text-muted-foreground">Scale:</span>{" "}
                <span className="font-mono">
                  {scaleMode === "uniform"
                    ? scale.x.toFixed(2)
                    : `${scale.x.toFixed(1)} × ${scale.y.toFixed(1)} × ${scale.z.toFixed(1)}`}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cor RGBA */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Cor (RGBA)</p>
          <div className="space-y-1.5">
            {(["r", "g", "b", "a"] as const).map(ch => (
              <div key={ch} className="flex items-center gap-2">
                <label className="text-[10px] font-mono text-muted-foreground w-3 uppercase">{ch}</label>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={color[ch]}
                  onChange={e => updateColor(ch, parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <MriInput
                  type="number"
                  min={0}
                  max={255}
                  value={color[ch]}
                  onChange={e => updateColor(ch, parseInt(e.target.value) || 0)}
                  className="w-16 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Scale</p>
            <button
              onClick={() => {
                if (scaleMode === "uniform") {
                  // Quando muda para xyz, preserva valor uniforme
                  update({ scale: { x: scale.x, y: scale.x, z: scale.x } })
                }
              }}
              className="text-[9px] text-muted-foreground hover:text-foreground"
            >
              {scaleMode === "uniform" ? "(uniforme)" : "(x, y, z)"}
            </button>
          </div>
          {scaleMode === "uniform" ? (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.05}
                value={scale.x}
                onChange={e => updateScale("x", parseFloat(e.target.value))}
                className="flex-1 accent-primary"
              />
              <MriInput
                type="number"
                min={0.1}
                max={10}
                step={0.05}
                value={scale.x}
                onChange={e => updateScale("x", parseFloat(e.target.value) || 0)}
                className="w-20 text-xs"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(["x", "y", "z"] as const).map(axis => (
                <div key={axis} className="flex flex-col">
                  <label className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">{axis}</label>
                  <MriInput
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.05}
                    value={scale[axis]}
                    onChange={e => updateScale(axis, parseFloat(e.target.value) || 0)}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// MarkerPreview — usado em 3 lugares: trigger compacto, item da lista, preview grande.
//
// Aplica `mix-blend-mode: multiply` sobre fundo colorido sólido pra replicar
// o que DrawMarker faz no jogo: textura branca-acinzentada multiplicada pela
// cor RGBA. Onde o PNG é claro (marker), a cor aparece; onde é escuro (fundo
// do PNG), permanece escuro. Alpha controla a opacidade da camada inteira.
// ────────────────────────────────────────────────────────────

interface MarkerPreviewProps {
  file: string | undefined
  base: string
  color: MarkerColor
  className?: string
  imageStyle?: React.CSSProperties
  fallbackText?: string
}

function MarkerPreview({ file, base, color, className, imageStyle, fallbackText }: MarkerPreviewProps) {
  const colorCss = `rgba(${color.r}, ${color.g}, ${color.b}, ${(color.a / 255).toFixed(2)})`

  if (!file) {
    return (
      <div
        className={cn("flex items-center justify-center border border-border", className)}
        style={{ backgroundColor: colorCss }}
      >
        {fallbackText && (
          <span className="text-[8px] font-mono text-white mix-blend-difference">
            {fallbackText}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn("relative flex items-center justify-center border border-border overflow-hidden", className)}
      style={{ backgroundColor: "#000", isolation: "isolate" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
          opacity: color.a / 255,
        }}
      />
      <img
        src={`${base}${file}`}
        alt=""
        className="relative object-contain w-full h-full"
        style={{
          ...imageStyle,
          mixBlendMode: "multiply",
          opacity: color.a / 255,
        }}
        onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Hook compartilhado: faz fetch do índice e mescla com defaults
// ────────────────────────────────────────────────────────────

function useMergedMarkers(
  providedMarkerTypes: MarkerType[] | undefined,
  indexUrl: string
): MarkerType[] {
  const [fetched, setFetched] = useState<MarkerType[] | null>(null)

  useEffect(() => {
    if (providedMarkerTypes) return
    let cancelled = false
    fetch(indexUrl)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data: unknown) => {
        if (cancelled) return
        const idx = data as Partial<FivemRefsIndex>
        if (idx && Array.isArray(idx.markers)) {
          const merged: MarkerType[] = idx.markers.map(m => {
            const def = DEFAULT_MARKER_TYPES.find(d => d.id === m.id)
            return {
              id: m.id,
              name: def?.name ?? m.name,
              description: def?.description,
              file: m.file,
              available: m.available,
            }
          })
          setFetched(merged)
        }
      })
      .catch(() => { /* silencioso — fallback usa DEFAULT_MARKER_TYPES */ })
    return () => { cancelled = true }
  }, [providedMarkerTypes, indexUrl])

  return providedMarkerTypes ?? fetched ?? []
}
