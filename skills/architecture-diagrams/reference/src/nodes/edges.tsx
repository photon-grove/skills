import {BaseEdge, type Edge, type EdgeProps, type EdgeTypes} from '@xyflow/react'
import type {ReactElement} from 'react'

/** A single waypoint in flow (absolute) coordinates. */
export interface RoutePoint {
  x: number
  y: number
}

/**
 * Geometry handed to {@link OrthogonalEdge} by the ELK layout pass. `points` is
 * the full waypoint list ELK routed (start on the source border → bend points →
 * end on the target border); `labelX/labelY` is the label center ELK reserved
 * space for in the gap between layers.
 */
export interface OrthogonalEdgeData extends Record<string, unknown> {
  points: RoutePoint[]
  labelX?: number
  labelY?: number
}

const dist = (a: RoutePoint, b: RoutePoint): number => Math.hypot(b.x - a.x, b.y - a.y)

/** A point `r` units from `from` along the segment toward `to`. */
function towards(from: RoutePoint, to: RoutePoint, r: number): RoutePoint {
  const len = dist(from, to) || 1
  return {x: from.x + ((to.x - from.x) / len) * r, y: from.y + ((to.y - from.y) / len) * r}
}

/**
 * Build an SVG path through `points` with rounded corners. Each interior vertex
 * becomes a quadratic curve whose radius is clamped to half the shorter adjacent
 * segment, so tight bends stay clean and never overshoot. Works for ELK's
 * orthogonal routes as well as any polyline.
 */
export function buildRoutePath(points: RoutePoint[], radius = 12): string {
  const first = points[0]
  const second = points[1]
  if (!first || !second) return ''
  if (points.length === 2) return `M ${first.x},${first.y} L ${second.x},${second.y}`

  let d = `M ${first.x},${first.y}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]
    if (!prev || !curr || !next) continue
    const r = Math.min(radius, dist(prev, curr) / 2, dist(curr, next) / 2)
    const enter = towards(curr, prev, r)
    const exit = towards(curr, next, r)
    d += ` L ${enter.x},${enter.y} Q ${curr.x},${curr.y} ${exit.x},${exit.y}`
  }
  const last = points[points.length - 1]
  if (last) d += ` L ${last.x},${last.y}`

  return d
}

/**
 * Renders an edge along the exact waypoints ELK computed, instead of letting
 * React Flow re-derive a curve between fixed handles. This is what keeps edges
 * from cutting across unrelated nodes or looping backward: the geometry is the
 * layout engine's, not a naive handle-to-handle smoothstep.
 */
export function OrthogonalEdge(props: EdgeProps): ReactElement {
  const {
    id,
    data,
    style,
    markerEnd,
    label,
    labelStyle,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
  } = props
  const geometry = data as OrthogonalEdgeData | undefined
  const points = geometry?.points ?? []
  const path = buildRoutePath(points)

  return (
    <BaseEdge
      id={id}
      path={path}
      style={style}
      markerEnd={markerEnd}
      label={label}
      labelX={geometry?.labelX}
      labelY={geometry?.labelY}
      labelStyle={labelStyle}
      labelShowBg={label != null}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
    />
  )
}

export const edgeTypes: EdgeTypes = {
  orthogonal: OrthogonalEdge,
}

export type OrthogonalEdgeType = Edge<OrthogonalEdgeData, 'orthogonal'>
</content>
