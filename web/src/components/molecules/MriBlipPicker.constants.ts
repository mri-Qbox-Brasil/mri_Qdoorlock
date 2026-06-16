// ────────────────────────────────────────────────────────────
// Paleta oficial de 86 blip colors (IDs 0-85) e tipos relacionados
//
// Movido para arquivo separado para satisfazer react-refresh/only-export-components
// (HMR do Vite só preserva estado se o módulo exporta APENAS componentes).
//
// Fontes:
//   - docs.fivem.net/docs/game-references/blips (nomes)
//   - forum.cfx.re/t/development-blip-colour-id-to-rgb (RGB)
// ────────────────────────────────────────────────────────────

export interface BlipColor {
  id: number
  name: string
  hex: string
}

export interface BlipManifestEntry {
  id: number
  /** Nome sem extensão e sem o prefixo numérico. Ex: "radar_higher" */
  name: string
  /**
   * Path do asset no CDN (já inclui prefixo de pasta e extensão).
   * Ex: "blips/000_radar_higher.gif". Quando fornecido, é usado direto para
   * compor a URL final como `${cdnBase}${file}`. Quando ausente, o componente
   * cai num fallback (`blips/{idPadded3}_{name}.webp`).
   */
  file?: string
  /** Se false, o item é omitido da lista visível por padrão. */
  available?: boolean
}

/**
 * Schema do índice publicado em
 *   https://assets.mriqbox.com.br/fivem_refs_index.json
 *
 * Gerado a partir do citizenfx/fivem-docs. Combina blips e markers num único
 * arquivo. O componente faz fetch quando `manifest`/`markerTypes` não é
 * passado explicitamente.
 */
export interface FivemRefsIndex {
  generated_at: string
  source: string
  image_base?: string
  stats?: {
    blips?:   { total: number; available: number; missing: number }
    markers?: { total: number; available: number; missing: number }
  }
  pages?: string[]
  blips:   BlipManifestEntry[]
  markers: { id: number; name: string; file?: string; available?: boolean }[]
}

export const DEFAULT_FIVEM_REFS_URL = "https://assets.mriqbox.com.br/fivem_refs_index.json"

export const DEFAULT_BLIP_COLORS: BlipColor[] = [
  { id: 0,  name: "White",            hex: "#FEFEFE" },
  { id: 1,  name: "Red",              hex: "#E03232" },
  { id: 2,  name: "Green",            hex: "#71CB71" },
  { id: 3,  name: "Blue",             hex: "#5DB6E5" },
  { id: 4,  name: "White",            hex: "#FEFEFE" },
  { id: 5,  name: "Yellow",           hex: "#EEC64E" },
  { id: 6,  name: "Light Red",        hex: "#C25050" },
  { id: 7,  name: "Violet",           hex: "#9C6EAF" },
  { id: 8,  name: "Pink",             hex: "#FE7AC3" },
  { id: 9,  name: "Light Orange",     hex: "#F59D79" },
  { id: 10, name: "Light Brown",      hex: "#B18F83" },
  { id: 11, name: "Light Green",      hex: "#8DCEA7" },
  { id: 12, name: "Light Blue",       hex: "#70A8AE" },
  { id: 13, name: "Light Purple",     hex: "#D3D1E7" },
  { id: 14, name: "Dark Purple",      hex: "#8F7E98" },
  { id: 15, name: "Cyan",             hex: "#6AC4BF" },
  { id: 16, name: "Light Yellow",     hex: "#D5C398" },
  { id: 17, name: "Orange",           hex: "#EA8E50" },
  { id: 18, name: "Light Blue",       hex: "#97CAE9" },
  { id: 19, name: "Dark Pink",        hex: "#B26287" },
  { id: 20, name: "Dark Yellow",      hex: "#8F8D79" },
  { id: 21, name: "Dark Orange",      hex: "#A6755E" },
  { id: 22, name: "Light Gray",       hex: "#AFA8A8" },
  { id: 23, name: "Light Pink",       hex: "#E78D9A" },
  { id: 24, name: "Lemon Green",      hex: "#BBD65B" },
  { id: 25, name: "Forest Green",     hex: "#0C7B56" },
  { id: 26, name: "Electric Blue",    hex: "#7AC3FE" },
  { id: 27, name: "Bright Purple",    hex: "#AB3CE6" },
  { id: 28, name: "Dark Yellow",      hex: "#CDA80C" },
  { id: 29, name: "Dark Blue",        hex: "#4561AB" },
  { id: 30, name: "Dark Cyan",        hex: "#29A5B8" },
  { id: 31, name: "Light Brown",      hex: "#B89B7B" },
  { id: 32, name: "Light Blue",       hex: "#C8E0FE" },
  { id: 33, name: "Light Yellow",     hex: "#F0F096" },
  { id: 34, name: "Light Pink",       hex: "#ED8CA1" },
  { id: 35, name: "Light Red",        hex: "#F98A8A" },
  { id: 36, name: "Beige",            hex: "#FBEEA5" },
  { id: 37, name: "White",            hex: "#FEFEFE" },
  { id: 38, name: "Blue",             hex: "#2C6DB8" },
  { id: 39, name: "Light Gray",       hex: "#9A9A9A" },
  { id: 40, name: "Dark Gray",        hex: "#4C4C4C" },
  { id: 41, name: "Pink Red",         hex: "#F29D9D" },
  { id: 42, name: "Blue",             hex: "#6CB7D6" },
  { id: 43, name: "Light Green",      hex: "#AFEDAE" },
  { id: 44, name: "Light Orange",     hex: "#FFA75F" },
  { id: 45, name: "White",            hex: "#F1F1F1" },
  { id: 46, name: "Gold",             hex: "#ECF029" },
  { id: 47, name: "Orange",           hex: "#FF9A18" },
  { id: 48, name: "Brilliant Rose",   hex: "#F644A5" },
  { id: 49, name: "Red",              hex: "#E03A3A" },
  { id: 50, name: "Medium Purple",    hex: "#8A6DE3" },
  { id: 51, name: "Salmon",           hex: "#FF8B5C" },
  { id: 52, name: "Dark Green",       hex: "#416C41" },
  { id: 53, name: "Blizzard Blue",    hex: "#B3DDF3" },
  { id: 54, name: "Oracle Blue",      hex: "#3A6479" },
  { id: 55, name: "Silver",           hex: "#A0A0A0" },
  { id: 56, name: "Brown",            hex: "#847232" },
  { id: 57, name: "Blue",             hex: "#65B9E7" },
  { id: 58, name: "East Bay",         hex: "#4B4175" },
  { id: 59, name: "Red",              hex: "#E13B3B" },
  { id: 60, name: "Yellow Orange",    hex: "#F0CB58" },
  { id: 61, name: "Mulberry Pink",    hex: "#CD3F98" },
  { id: 62, name: "Alto Gray",        hex: "#CFCFCF" },
  { id: 63, name: "Jelly Bean Blue",  hex: "#276A9F" },
  { id: 64, name: "Dark Orange",      hex: "#D87B1B" },
  { id: 65, name: "Mamba",            hex: "#8E8393" },
  { id: 66, name: "Yellow Orange",    hex: "#F0CB57" },
  { id: 67, name: "Blue",             hex: "#65B9E7" },
  { id: 68, name: "Blue",             hex: "#65B9E7" },
  { id: 69, name: "Green",            hex: "#79CD79" },
  { id: 70, name: "Yellow Orange",    hex: "#EFCA57" },
  { id: 71, name: "Yellow Orange",    hex: "#EFCA57" },
  { id: 72, name: "Transparent Black",hex: "#3D3D3D" },
  { id: 73, name: "Yellow Orange",    hex: "#EFCA57" },
  { id: 74, name: "Blue",             hex: "#65B9E7" },
  { id: 75, name: "Red",              hex: "#E03232" },
  { id: 76, name: "Deep Red",         hex: "#782323" },
  { id: 77, name: "Blue",             hex: "#65B9E7" },
  { id: 78, name: "Oracle Blue",      hex: "#3A6479" },
  { id: 79, name: "Transparent Red",  hex: "#E03232" },
  { id: 80, name: "Transparent Blue", hex: "#65B9E7" },
  { id: 81, name: "Orange",           hex: "#F2A40C" },
  { id: 82, name: "Light Green",      hex: "#A4CCAA" },
  { id: 83, name: "Purple",           hex: "#A854F2" },
  { id: 84, name: "Blue",             hex: "#65B9E7" },
  { id: 85, name: "Transparent Black",hex: "#3D3D3D" },
]
