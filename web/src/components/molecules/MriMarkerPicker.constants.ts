// ────────────────────────────────────────────────────────────
// Lista oficial de marker types (0-43) do GTA V / FiveM e tipos relacionados
//
// Movido para arquivo separado para satisfazer react-refresh/only-export-components.
// Fonte: docs.fivem.net/natives/?_0x28477EC23D892089 (DrawMarker)
// ────────────────────────────────────────────────────────────

export interface MarkerType {
  id: number
  name: string
  description?: string
  /** Path do asset no CDN (já inclui prefixo de pasta e extensão).
   *  Ex: "markers/00_MarkerTypeUpsideDownCone.png". Quando ausente, o
   *  preview cai num fallback ou exibe placeholder. */
  file?: string
  /** Se false, o item é omitido da lista por padrão. */
  available?: boolean
}

export interface MarkerColor {
  r: number  // 0-255
  g: number  // 0-255
  b: number  // 0-255
  a: number  // 0-255
}

export interface MarkerScale {
  x: number
  y: number
  z: number
}

export const DEFAULT_MARKER_TYPES: MarkerType[] = [
  { id: 0,  name: "Upside Down Cone",              description: "Cone apontando para baixo (mais comum)" },
  { id: 1,  name: "Vertical Cylinder",             description: "Cilindro vertical" },
  { id: 2,  name: "Thick Chevron Up",              description: "Chevron grosso apontando para cima" },
  { id: 3,  name: "Thin Chevron Up",               description: "Chevron fino apontando para cima" },
  { id: 4,  name: "Checkered Flag Rect",           description: "Bandeira quadriculada retangular" },
  { id: 5,  name: "Checkered Flag Circle",         description: "Bandeira quadriculada circular" },
  { id: 6,  name: "Verticle Circle",               description: "Círculo vertical (typo original)" },
  { id: 7,  name: "Plane Model",                   description: "Modelo 3D de avião" },
  { id: 8,  name: "Lost MC Dark",                  description: "Logo Lost MC versão escura" },
  { id: 9,  name: "Lost MC Light",                 description: "Logo Lost MC versão clara" },
  { id: 10, name: "Number 0",                      description: "Dígito 0" },
  { id: 11, name: "Number 1",                      description: "Dígito 1" },
  { id: 12, name: "Number 2",                      description: "Dígito 2" },
  { id: 13, name: "Number 3",                      description: "Dígito 3" },
  { id: 14, name: "Number 4",                      description: "Dígito 4" },
  { id: 15, name: "Number 5",                      description: "Dígito 5" },
  { id: 16, name: "Number 6",                      description: "Dígito 6" },
  { id: 17, name: "Number 7",                      description: "Dígito 7" },
  { id: 18, name: "Number 8",                      description: "Dígito 8" },
  { id: 19, name: "Number 9",                      description: "Dígito 9" },
  { id: 20, name: "Chevron Up x1",                 description: "1 chevron empilhado" },
  { id: 21, name: "Chevron Up x2",                 description: "2 chevrons empilhados" },
  { id: 22, name: "Chevron Up x3",                 description: "3 chevrons empilhados" },
  { id: 23, name: "Horizontal Circle Fat",         description: "Círculo horizontal grosso (anel no chão)" },
  { id: 24, name: "Replay Icon",                   description: "Ícone de replay" },
  { id: 25, name: "Horizontal Circle Skinny",      description: "Círculo horizontal fino" },
  { id: 26, name: "Horizontal Circle Skinny Arrow",description: "Círculo horizontal fino com seta" },
  { id: 27, name: "Horizontal Split Arrow Circle", description: "Círculo horizontal com seta dividida" },
  { id: 28, name: "Debug Sphere",                  description: "Esfera sólida de debug" },
  { id: 29, name: "Dollar Sign",                   description: "Cifrão" },
  { id: 30, name: "Horizontal Bars",               description: "Barras horizontais" },
  { id: 31, name: "Wolf Head",                     description: "Cabeça de lobo" },
  { id: 32, name: "Question Mark",                 description: "Ponto de interrogação" },
  { id: 33, name: "Plane Symbol",                  description: "Símbolo de avião" },
  { id: 34, name: "Helicopter Symbol",             description: "Símbolo de helicóptero" },
  { id: 35, name: "Boat Symbol",                   description: "Símbolo de barco" },
  { id: 36, name: "Car Symbol",                    description: "Símbolo de carro" },
  { id: 37, name: "Motorcycle Symbol",             description: "Símbolo de moto" },
  { id: 38, name: "Bike Symbol",                   description: "Símbolo de bicicleta" },
  { id: 39, name: "Truck Symbol",                  description: "Símbolo de caminhão" },
  { id: 40, name: "Parachute Symbol",              description: "Símbolo de paraquedas" },
  { id: 41, name: "Unknown (41)",                  description: "ID reservado / desconhecido" },
  { id: 42, name: "Sawblade Symbol",               description: "Símbolo de serra circular" },
  { id: 43, name: "Unknown (43)",                  description: "ID reservado / desconhecido" },
]
