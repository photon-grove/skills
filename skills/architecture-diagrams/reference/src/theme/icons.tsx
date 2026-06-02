import type {ReactElement} from 'react'

import type {NodeKind} from '../types'

/**
 * A compact line-icon set. Keys can be referenced from `DiagramNode.icon`;
 * otherwise a sensible glyph is derived from the node kind.
 */
const PATHS: Record<string, ReactElement> = {
  service: (
    <>
      <rect x="3" y="4" width="14" height="5" rx="1.4" />
      <rect x="3" y="11" width="14" height="5" rx="1.4" />
      <path d="M6 6.5h0M6 13.5h0" />
    </>
  ),
  worker: (
    <>
      <circle cx="10" cy="10" r="3" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.2 5.2l1.4 1.4M13.4 13.4l1.4 1.4M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4" />
    </>
  ),
  lambda: <path d="M5 16l4-12 5 12M7.5 9h6" />,
  datastore: (
    <>
      <ellipse cx="10" cy="5.5" rx="6" ry="2.4" />
      <path d="M4 5.5v9c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4v-9" />
      <path d="M4 10c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4" />
    </>
  ),
  bucket: (
    <>
      <path d="M4 5h12l-1.2 11.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8z" />
      <path d="M4 5h12" />
    </>
  ),
  queue: (
    <>
      <rect x="3" y="6" width="3.4" height="8" rx="1" />
      <rect x="8.3" y="6" width="3.4" height="8" rx="1" />
      <rect x="13.6" y="6" width="3.4" height="8" rx="1" />
    </>
  ),
  topic: (
    <>
      <circle cx="6" cy="10" r="2.2" />
      <path d="M8 9l6-3M8 11l6 3" />
      <circle cx="15" cy="5.5" r="1.8" />
      <circle cx="15" cy="14.5" r="1.8" />
    </>
  ),
  event: <path d="M11 3L4 11h5l-1 6 7-8h-5z" />,
  external: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2 2 12 0 14M10 3c-2 2-2 12 0 14" />
    </>
  ),
  process: (
    <>
      <path d="M3 7h9l3 3-3 3H3z" />
      <path d="M12 7l3 3-3 3" />
    </>
  ),
  client: (
    <>
      <rect x="3" y="4" width="14" height="9" rx="1.4" />
      <path d="M7 16h6M10 13v3" />
    </>
  ),
  browser: (
    <>
      <rect x="3" y="4" width="14" height="12" rx="1.6" />
      <path d="M3 7.5h14M5.5 5.7h0M7.3 5.7h0" />
    </>
  ),
  brain: (
    <>
      <path d="M8.5 4a2.4 2.4 0 0 0-2.4 2.4A2.2 2.2 0 0 0 5 10a2.3 2.3 0 0 0 1.4 3.6A2.2 2.2 0 0 0 8.5 16" />
      <path d="M11.5 4a2.4 2.4 0 0 1 2.4 2.4A2.2 2.2 0 0 1 15 10a2.3 2.3 0 0 1-1.4 3.6A2.2 2.2 0 0 1 11.5 16" />
      <path d="M10 4v12" />
    </>
  ),
  ai: (
    <>
      <rect x="4" y="4" width="12" height="12" rx="2.5" />
      <path d="M7.5 13V8l2.5 3 2.5-3v5" />
    </>
  ),
  shield: <path d="M10 3l6 2v4c0 4-2.6 6.7-6 8-3.4-1.3-6-4-6-8V5z" />,
  user: (
    <>
      <circle cx="10" cy="7" r="3" />
      <path d="M4.5 16c.9-2.5 2.7-3.8 5.5-3.8s4.6 1.3 5.5 3.8" />
    </>
  ),
  search: (
    <>
      <circle cx="9" cy="9" r="5" />
      <path d="M13 13l4 4" />
    </>
  ),
  catalog: (
    <>
      <rect x="4" y="3" width="12" height="14" rx="1.4" />
      <path d="M7 6h6M7 9h6M7 12h4" />
    </>
  ),
  schedule: (
    <>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 6v4l3 2" />
    </>
  ),
  metrics: <path d="M3 16V8M8 16V4M13 16v-6M3 16h14" />,
  gear: (
    <>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 3v2.2M10 14.8V17M3 10h2.2M14.8 10H17M5.2 5.2l1.6 1.6M13.2 13.2l1.6 1.6M14.8 5.2l-1.6 1.6M6.8 13.2l-1.6 1.6" />
    </>
  ),
  cookie: (
    <>
      <path d="M10 3a7 7 0 1 0 7 7 3 3 0 0 1-3-3 3 3 0 0 1-3-3 4 4 0 0 0-1-1z" />
      <path d="M8 9h0M11.5 11.5h0M7.5 13h0" />
    </>
  ),
}

const KIND_DEFAULT: Record<NodeKind, string> = {
  service: 'service',
  datastore: 'datastore',
  queue: 'queue',
  topic: 'topic',
  external: 'external',
  process: 'process',
  client: 'client',
  boundary: 'gear',
}

export function DiagramIcon({
  name,
  kind,
  size = 18,
}: {
  name?: string
  kind: NodeKind
  size?: number
}): ReactElement {
  const key = (name && PATHS[name] ? name : KIND_DEFAULT[kind]) || 'service'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[key]}
    </svg>
  )
}
</content>
