import type {ReactElement} from 'react'

import {DiagramIcon} from './theme/icons'
import {DOMAIN_PALETTE, EDGE_STYLE, EDGE_VARIANT_LABEL, KIND_LABEL} from './theme/tokens'
import type {DiagramSpec, EdgeVariant, NodeKind} from './types'

const DOMAIN_TITLES: Record<string, string> = {
  web: 'Web tier',
  client: 'Client',
  api: 'API',
  auth: 'Auth / IdP',
  ingestion: 'Ingestion',
  planner: 'Planner',
  ai: 'AI / Bedrock',
  data: 'Data store',
  queue: 'Queue',
  event: 'Events',
  external: 'External',
  observability: 'Observability',
  domain: 'Domain model',
}

/**
 * A compact, self-explaining key. By default it only lists the node kinds,
 * domains, and edge variants actually present in `spec`, so each diagram's
 * legend stays relevant.
 */
export function Legend({spec}: {spec?: DiagramSpec}): ReactElement {
  const kinds = new Set<NodeKind>()
  const domains = new Set<string>()
  const variants = new Set<EdgeVariant>()
  if (spec) {
    for (const node of spec.nodes) {
      if (node.kind !== 'boundary') kinds.add(node.kind)
      if (node.domain && DOMAIN_PALETTE[node.domain]) domains.add(node.domain)
    }
    for (const edge of spec.edges) variants.add(edge.variant ?? 'data')
  }

  const kindList = spec ? [...kinds] : (Object.keys(KIND_LABEL) as NodeKind[])
  const domainList = spec ? [...domains] : Object.keys(DOMAIN_PALETTE)
  const variantList = spec ? [...variants] : (Object.keys(EDGE_STYLE) as EdgeVariant[])

  return (
    <div className="rfd-legend">
      <LegendGroup title="Domains">
        {domainList.map((domain) => (
          <span key={domain} className="rfd-legend__item">
            <span
              className="rfd-legend__swatch"
              style={{background: DOMAIN_PALETTE[domain]?.accent}}
            />
            {DOMAIN_TITLES[domain] ?? domain}
          </span>
        ))}
      </LegendGroup>
      <LegendGroup title="Nodes">
        {kindList.map((kind) => (
          <span key={kind} className="rfd-legend__item">
            <span className="rfd-legend__glyph">
              <DiagramIcon kind={kind} size={14} />
            </span>
            {KIND_LABEL[kind]}
          </span>
        ))}
      </LegendGroup>
      <LegendGroup title="Edges">
        {variantList.map((variant) => {
          const style = EDGE_STYLE[variant]
          return (
            <span key={variant} className="rfd-legend__item">
              <svg width="26" height="10" aria-hidden="true">
                <line
                  x1="1"
                  y1="5"
                  x2="25"
                  y2="5"
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dash}
                />
              </svg>
              {EDGE_VARIANT_LABEL[variant]}
            </span>
          )
        })}
      </LegendGroup>
    </div>
  )
}

function LegendGroup({title, children}: {title: string; children: ReactElement[]}): ReactElement {
  return (
    <div className="rfd-legend__group">
      <span className="rfd-legend__title">{title}</span>
      <div className="rfd-legend__items">{children}</div>
    </div>
  )
}
</content>
