import {Handle, Position, type NodeProps, type NodeTypes} from '@xyflow/react'
import type {CSSProperties, ReactElement} from 'react'

import {DiagramIcon} from '../theme/icons'
import {domainColor} from '../theme/tokens'
import type {DiagramNodeData} from '../types'

function accentVars(domain?: string): CSSProperties {
  const {accent, soft} = domainColor(domain)
  return {'--rfd-accent': accent, '--rfd-soft': soft} as CSSProperties
}

/** Source/target handle positions for the active flow direction. */
function handlePositions(direction: 'RIGHT' | 'DOWN'): {target: Position; source: Position} {
  return direction === 'DOWN'
    ? {target: Position.Top, source: Position.Bottom}
    : {target: Position.Left, source: Position.Right}
}

/** Leaf node: service, datastore, queue, topic, external, process, client. */
function LeafNode({data}: NodeProps): ReactElement {
  const {node, direction} = data as DiagramNodeData
  const pos = handlePositions(direction)
  const metaEntries = node.meta ? Object.entries(node.meta).slice(0, 3) : []

  return (
    <div className="rfd-node" style={accentVars(node.domain)}>
      <Handle className="rfd-handle" type="target" position={pos.target} id="in" />
      <div className="rfd-node__bar" />
      <div className="rfd-node__body">
        <div className="rfd-node__head">
          <span className="rfd-node__icon">
            <DiagramIcon name={node.icon} kind={node.kind} />
          </span>
          <span className="rfd-node__title">{node.label}</span>
        </div>
        {node.sublabel ? <div className="rfd-node__sub">{node.sublabel}</div> : null}
        {metaEntries.length > 0 ? (
          <div className="rfd-node__meta">
            {metaEntries.map(([key, value]) => (
              <span key={key} className="rfd-chip" title={`${key}: ${value}`}>
                {value}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <Handle className="rfd-handle" type="source" position={pos.source} id="out" />
    </div>
  )
}

/** Container that visually groups its child nodes. */
function BoundaryNode({data}: NodeProps): ReactElement {
  const {node} = data as DiagramNodeData
  return (
    <div className="rfd-boundary" style={accentVars(node.domain)}>
      <span className="rfd-boundary__label">{node.label}</span>
    </div>
  )
}

export const nodeTypes: NodeTypes = {
  service: LeafNode,
  datastore: LeafNode,
  queue: LeafNode,
  topic: LeafNode,
  external: LeafNode,
  process: LeafNode,
  client: LeafNode,
  boundary: BoundaryNode,
}
</content>
