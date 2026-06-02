import {MarkerType, type Edge, type Node} from '@xyflow/react'
import ELK, {type ElkNode} from 'elkjs/lib/elk.bundled.js'

import {EDGE_STYLE, domainColor, nodeSize} from '../theme/tokens'
import type {DiagramNode, DiagramNodeData, DiagramSpec} from '../types'

export interface LaidOutGraph {
  nodes: Node<DiagramNodeData>[]
  edges: Edge[]
}

const ROOT_OPTIONS: Record<string, string> = {
  'elk.algorithm': 'layered',
  // Wide layer gaps give edge labels room to sit in the gap between layers
  // instead of stacking on top of the bundled edges (the main readability win).
  'elk.layered.spacing.nodeNodeBetweenLayers': '130',
  'elk.spacing.nodeNode': '64',
  'elk.layered.spacing.edgeNodeBetweenLayers': '34',
  'elk.layered.spacing.edgeEdgeBetweenLayers': '16',
  'elk.spacing.edgeNode': '28',
  'elk.spacing.edgeEdge': '16',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  // Route edges orthogonally and KEEP the result: the rendered edges follow
  // ELK's waypoints (see runElkLayout below), so they bend around nodes instead
  // of cutting through them. Without consuming these, back/cycle edges wrap all
  // the way around nodes and the diagram turns into a tangle.
  'elk.edgeRouting': 'ORTHOGONAL',
  // Let ELK place edge labels (centered, with breathing room) so they land in
  // the inter-layer gap rather than colliding on top of the bundled edges.
  'elk.edgeLabels.placement': 'CENTER',
  'elk.spacing.edgeLabel': '6',
  // Bias toward a balanced (less extreme) aspect ratio so wide fan-outs don't
  // sprawl into a thin band with lots of dead canvas.
  'elk.aspectRatio': '1.7',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
}

/** Rough text width so ELK reserves the right gap for an edge label. */
function estimateLabelWidth(text: string): number {
  return Math.max(20, Math.round(text.length * 6.4 + 14))
}

/** Center of a polyline by arc length — fallback when ELK gives no label box. */
function polylineMidpoint(points: {x: number; y: number}[]): {x: number; y: number} | undefined {
  const first = points[0]
  if (!first) return undefined
  if (points.length === 1) return first

  let total = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    if (prev && curr) total += Math.hypot(curr.x - prev.x, curr.y - prev.y)
  }

  let walked = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    if (!prev || !curr) continue
    const seg = Math.hypot(curr.x - prev.x, curr.y - prev.y)
    if (walked + seg >= total / 2) {
      const t = seg === 0 ? 0 : (total / 2 - walked) / seg
      return {x: prev.x + (curr.x - prev.x) * t, y: prev.y + (curr.y - prev.y) * t}
    }
    walked += seg
  }

  return points[points.length - 1] ?? first
}

/** ELK routing read back for one edge: waypoints + (optional) label center. */
interface EdgeRouting {
  points: {x: number; y: number}[]
  labelX?: number
  labelY?: number
}

/**
 * Lay a DiagramSpec out with ELK and translate the result into React Flow
 * nodes + styled edges. Boundary containers are nested via ELK hierarchy and
 * become React Flow parent nodes (child positions stay relative to the parent).
 */
export async function runElkLayout(spec: DiagramSpec): Promise<LaidOutGraph> {
  const direction = spec.layout?.direction ?? 'RIGHT'
  const byId = new Map(spec.nodes.map((n) => [n.id, n]))

  const childrenOf = new Map<string, DiagramNode[]>()
  const roots: DiagramNode[] = []
  for (const node of spec.nodes) {
    const parent = node.parent && byId.has(node.parent) ? node.parent : undefined
    if (parent) {
      const siblings = childrenOf.get(parent) ?? []
      siblings.push(node)
      childrenOf.set(parent, siblings)
    } else {
      roots.push(node)
    }
  }

  const isContainer = (node: DiagramNode): boolean =>
    (childrenOf.get(node.id)?.length ?? 0) > 0 || node.kind === 'boundary'

  const toElk = (node: DiagramNode): ElkNode => {
    if (isContainer(node)) {
      return {
        id: node.id,
        layoutOptions: {
          'elk.padding': '[top=36,left=18,bottom=18,right=18]',
          'elk.direction': direction,
        },
        children: (childrenOf.get(node.id) ?? []).map(toElk),
      }
    }

    const {width, height} = nodeSize(node.kind)
    return {id: node.id, width, height}
  }

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {...ROOT_OPTIONS, 'elk.direction': direction},
    children: roots.map(toElk),
    edges: spec.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      ...(edge.label
        ? {
            labels: [
              {
                id: `${edge.id}__label`,
                text: edge.label,
                width: estimateLabelWidth(edge.label),
                height: 16,
              },
            ],
          }
        : {}),
    })),
  }

  const laid = await new ELK().layout(graph)

  const nodes: Node<DiagramNodeData>[] = []
  const walk = (elkNode: ElkNode, parentId?: string): void => {
    const node = byId.get(elkNode.id)
    if (node) {
      const fallback = nodeSize(node.kind)
      const width = elkNode.width ?? fallback.width
      const height = elkNode.height ?? fallback.height
      // Set width/height on the node object (not just style) so React Flow seeds
      // `measured` immediately and computes handle bounds — without this, edges
      // have no anchor points and silently fail to render.
      nodes.push({
        id: node.id,
        type: node.kind,
        position: {x: elkNode.x ?? 0, y: elkNode.y ?? 0},
        data: {node, direction},
        width,
        height,
        style: {width, height},
        ...(isContainer(node) ? {selectable: false} : {}),
        ...(parentId ? {parentId, extent: 'parent' as const} : {}),
      })
    }

    for (const child of elkNode.children ?? []) {
      walk(child, elkNode.id)
    }
  }
  for (const child of laid.children ?? []) {
    walk(child)
  }

  // Read back ELK's routing. With INCLUDE_CHILDREN, ELK reports each edge's
  // section/label coordinates relative to the LOWEST container that holds both
  // endpoints (their common ancestor boundary) — not relative to the root. A
  // boundary-internal edge (e.g. two children of `backend`) therefore comes back
  // in backend-local coordinates and must be shifted by backend's absolute
  // origin, or it renders detached from its nodes. We compute every node's
  // absolute position, then translate each edge by its endpoints' common-ancestor
  // offset into root (flow) coordinates — the space React Flow positions nodes in.
  const absById = new Map<string, {x: number; y: number}>()
  const computeAbs = (elkNode: ElkNode, ax: number, ay: number): void => {
    absById.set(elkNode.id, {x: ax, y: ay})
    for (const child of elkNode.children ?? []) {
      computeAbs(child, ax + (child.x ?? 0), ay + (child.y ?? 0))
    }
  }
  for (const child of laid.children ?? []) {
    computeAbs(child, child.x ?? 0, child.y ?? 0)
  }

  // ELK can park an edge at any tree level, so collect every result edge by id.
  const elkEdgeById = new Map<string, NonNullable<ElkNode['edges']>[number]>()
  const collectElkEdges = (elkNode: ElkNode): void => {
    for (const elkEdge of elkNode.edges ?? []) elkEdgeById.set(elkEdge.id, elkEdge)
    for (const child of elkNode.children ?? []) collectElkEdges(child)
  }
  collectElkEdges(laid)

  // Boundary chain (immediate parent → up) for a node, and the lowest common one.
  const ancestorsOf = (id: string): string[] => {
    const chain: string[] = []
    let cur = byId.get(id)?.parent
    while (cur && byId.has(cur)) {
      chain.push(cur)
      cur = byId.get(cur)?.parent
    }
    return chain
  }
  const commonAncestor = (a: string, b: string): string | undefined => {
    const bAncestors = new Set(ancestorsOf(b))
    return ancestorsOf(a).find((id) => bAncestors.has(id))
  }

  const routingFor = (edge: DiagramSpec['edges'][number]): EdgeRouting => {
    const elkEdge = elkEdgeById.get(edge.id)
    const anchor = commonAncestor(edge.source, edge.target)
    const offset = (anchor ? absById.get(anchor) : undefined) ?? {x: 0, y: 0}

    const section = elkEdge?.sections?.[0]
    const points = section
      ? [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map((p) => ({
          x: p.x + offset.x,
          y: p.y + offset.y,
        }))
      : []

    const elkLabel = elkEdge?.labels?.[0]
    if (elkLabel && elkLabel.x != null && elkLabel.y != null) {
      return {
        points,
        labelX: elkLabel.x + offset.x + (elkLabel.width ?? 0) / 2,
        labelY: elkLabel.y + offset.y + (elkLabel.height ?? 0) / 2,
      }
    }

    const mid = polylineMidpoint(points)

    return {points, labelX: mid?.x, labelY: mid?.y}
  }

  const edges: Edge[] = spec.edges.map((edge) => {
    const variant = edge.variant ?? 'data'
    const style = EDGE_STYLE[variant]
    const routing = routingFor(edge)
    const routed = routing.points.length >= 2
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: 'out',
      targetHandle: 'in',
      label: edge.label,
      // Follow ELK's waypoints when we have them; fall back to React Flow's own
      // smoothstep only if a route somehow came back empty.
      type: routed ? 'orthogonal' : 'smoothstep',
      ...(routed
        ? {data: {points: routing.points, labelX: routing.labelX, labelY: routing.labelY}}
        : {}),
      animated: edge.animated ?? style.animated,
      style: {stroke: style.stroke, strokeWidth: style.strokeWidth, strokeDasharray: style.dash},
      markerEnd:
        variant === 'dependency'
          ? undefined
          : {type: MarkerType.ArrowClosed, color: style.stroke, width: 15, height: 15},
      // Opaque, bordered chip so a label stays legible even when it lands on or
      // near another edge.
      labelBgStyle: {
        fill: 'var(--rfd-card)',
        fillOpacity: 1,
        stroke: 'var(--rfd-border)',
        strokeWidth: 1,
      },
      labelStyle: {fill: 'var(--rfd-ink)', fontWeight: 600, fontSize: 11},
      labelBgPadding: [7, 3],
      labelBgBorderRadius: 6,
    } satisfies Edge
  })

  return {nodes, edges}
}

// Re-exported for callers that want palette access alongside layout.
export {domainColor}
