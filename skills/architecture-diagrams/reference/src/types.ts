/**
 * The diagram data contract.
 *
 * This is the schema that diagram *data* files (or an LLM) populate. The
 * package owns the visual system and layout; callers only supply semantic
 * nodes and edges. Keep this stable — it is the public, reusable interface.
 */

/** Visual category of a node. Drives which component renders it. */
export type NodeKind =
  | 'service' // a running service / lambda / worker
  | 'datastore' // a database / table / bucket
  | 'queue' // an async work queue
  | 'topic' // a pub/sub topic / event bus
  | 'external' // a third-party system outside our boundary
  | 'process' // a pipeline step / stage / function
  | 'client' // a browser / device / user-facing surface
  | 'boundary' // a container that groups child nodes

/**
 * A semantic domain used to color-code nodes. Free-form, but the built-in
 * palette knows the common ones (see DOMAIN_PALETTE). Unknown domains fall
 * back to a neutral color.
 */
export type DiagramDomain = string

export interface DiagramNode {
  id: string
  kind: NodeKind
  label: string
  /** Secondary line under the label (e.g. tech, table name, ARN suffix). */
  sublabel?: string
  /** Color-coding bucket. See DOMAIN_PALETTE for built-in keys. */
  domain?: DiagramDomain
  /** Icon slot key (see ICONS). Falls back to a kind-derived glyph. */
  icon?: string
  /** Parent boundary node id — nests this node inside a container. */
  parent?: string
  /**
   * Arbitrary key/value detail. The first up-to-3 entries render as chips on the
   * node card (the value is shown; the key appears in the chip's hover tooltip).
   */
  meta?: Record<string, string>
}

/** Visual + semantic flavor of an edge. */
export type EdgeVariant =
  | 'data' // synchronous data flow
  | 'request' // a request/response call
  | 'event' // an emitted event / stream record
  | 'async' // async hand-off through a queue (dashed, animated)
  | 'dependency' // a soft dependency / reference (dotted)

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label?: string
  variant?: EdgeVariant
  /** Force animation on/off; defaults are derived from the variant. */
  animated?: boolean
}

export interface DiagramLayout {
  /** Primary flow direction. 'RIGHT' = left-to-right (default), 'DOWN' = top-to-bottom. */
  direction?: 'RIGHT' | 'DOWN'
}

export interface DiagramSpec {
  id: string
  title: string
  /** Short caption shown in the viewer header and the diagram picker. */
  description?: string
  /** Optional grouping label for the picker sidebar. */
  group?: string
  layout?: DiagramLayout
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

/** Data carried into a custom React Flow node component. */
export interface DiagramNodeData extends Record<string, unknown> {
  node: DiagramNode
  direction: 'RIGHT' | 'DOWN'
}
