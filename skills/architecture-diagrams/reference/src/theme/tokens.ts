import type {EdgeVariant, NodeKind} from '../types'

/**
 * Domain → color. Drives the accent bar, icon chip, and minimap dot of a node.
 * `accent` is the strong line/icon color; `soft` is a translucent fill used
 * behind the icon and as the node's top gradient. Colors are chosen to read
 * well on both light and dark surfaces.
 */
export interface DomainColor {
  accent: string
  soft: string
}

export const DOMAIN_PALETTE: Record<string, DomainColor> = {
  web: {accent: '#38bdf8', soft: 'rgba(56,189,248,0.16)'},
  client: {accent: '#22d3ee', soft: 'rgba(34,211,238,0.16)'},
  api: {accent: '#a78bfa', soft: 'rgba(167,139,250,0.18)'},
  auth: {accent: '#f472b6', soft: 'rgba(244,114,182,0.16)'},
  ingestion: {accent: '#34d399', soft: 'rgba(52,211,153,0.16)'},
  planner: {accent: '#fbbf24', soft: 'rgba(251,191,36,0.18)'},
  ai: {accent: '#c084fc', soft: 'rgba(192,132,252,0.18)'},
  data: {accent: '#60a5fa', soft: 'rgba(96,165,250,0.16)'},
  queue: {accent: '#fb923c', soft: 'rgba(251,146,60,0.18)'},
  event: {accent: '#f59e0b', soft: 'rgba(245,158,11,0.16)'},
  external: {accent: '#94a3b8', soft: 'rgba(148,163,184,0.16)'},
  observability: {accent: '#4ade80', soft: 'rgba(74,222,128,0.14)'},
  domain: {accent: '#818cf8', soft: 'rgba(129,140,248,0.18)'},
}

const NEUTRAL: DomainColor = {accent: '#94a3b8', soft: 'rgba(148,163,184,0.16)'}

export function domainColor(domain?: string): DomainColor {
  const hit = domain ? DOMAIN_PALETTE[domain] : undefined
  return hit ?? NEUTRAL
}

/** Fixed render box per kind. Boundary containers are sized by ELK from children. */
export const NODE_SIZE: Record<Exclude<NodeKind, 'boundary'>, {width: number; height: number}> = {
  service: {width: 248, height: 96},
  datastore: {width: 224, height: 96},
  queue: {width: 224, height: 88},
  topic: {width: 224, height: 88},
  external: {width: 226, height: 90},
  process: {width: 238, height: 88},
  client: {width: 230, height: 94},
}

export function nodeSize(kind: NodeKind): {width: number; height: number} {
  if (kind === 'boundary') return {width: 320, height: 200}
  return NODE_SIZE[kind]
}

export interface EdgeStyle {
  stroke: string
  strokeWidth: number
  dash?: string
  animated: boolean
}

export const EDGE_STYLE: Record<EdgeVariant, EdgeStyle> = {
  data: {stroke: 'var(--rfd-edge, #64748b)', strokeWidth: 1.6, animated: false},
  request: {stroke: 'var(--rfd-edge-strong, #818cf8)', strokeWidth: 1.8, animated: false},
  event: {stroke: '#f59e0b', strokeWidth: 1.8, animated: true},
  async: {stroke: '#fb923c', strokeWidth: 1.8, dash: '6 5', animated: true},
  dependency: {
    stroke: 'var(--rfd-edge-muted, #94a3b8)',
    strokeWidth: 1.4,
    dash: '2 5',
    animated: false,
  },
}

export const EDGE_VARIANT_LABEL: Record<EdgeVariant, string> = {
  data: 'Data flow',
  request: 'Request / response',
  event: 'Event emitted',
  async: 'Async queue hand-off',
  dependency: 'Dependency / reference',
}

export const KIND_LABEL: Record<NodeKind, string> = {
  service: 'Service / worker',
  datastore: 'Data store',
  queue: 'Queue',
  topic: 'Topic / event bus',
  external: 'External system',
  process: 'Pipeline step',
  client: 'Client surface',
  boundary: 'Boundary',
}
</content>
