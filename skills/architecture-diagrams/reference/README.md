# reference/ — copy-paste toolkit

A verbatim, framework-agnostic copy of the React Flow + ELK diagram toolkit behind the Homunculus
`/docs` page. Drop `src/` into any React 18/19 app and you have the whole system.

## Install

```sh
npm i @xyflow/react elkjs      # pnpm add / yarn add also fine
```

## Copy

Copy `src/` into your project, e.g. `src/lib/diagrams/`. Keep the folder structure:

```
src/
  index.ts            # public exports — import everything from here
  types.ts            # DiagramSpec contract (the data you author)
  layout/elk.ts       # ELK layout + edge-route translation
  nodes/nodes.tsx     # themed leaf + boundary node components
  nodes/edges.tsx     # custom orthogonal edge (follows ELK waypoints)
  theme/tokens.ts     # domain palette, node sizes, edge styles
  theme/stylesheet.ts # the single injected stylesheet (CSS-var themed)
  theme/icons.tsx     # self-contained line-icon set
  ClientOnly.tsx      # SSR boundary
  DiagramCanvas.tsx   # one diagram → ELK → React Flow
  DiagramViewer.tsx   # sidebar + canvas + legend (the full experience)
  Legend.tsx          # auto-derived legend
examples/
  cqrs-event-sourcing.ts   # a complete spec to copy from
```

## Use

```tsx
import {DiagramViewer, type DiagramSpec} from '@/lib/diagrams'
import {cqrsEventSourcing} from './diagrams/cqrs-event-sourcing'

const DIAGRAMS: DiagramSpec[] = [cqrsEventSourcing /* , ... */]

export function DocsScreen() {
  return (
    <div style={{position: 'relative', width: '100%', height: 'calc(100dvh - 24px)'}}>
      <DiagramViewer diagrams={DIAGRAMS} title="My System" subtitle="Architecture" />
    </div>
  )
}
```

Mount `DocsScreen` on a **client-rendered** route (see SKILL.md → Rendering for Next.js `'use
client'` / `dynamic({ssr:false})` notes) and give the wrapper a real height.

## Theming

The stylesheet reads `--pg-*` design tokens with light-mode fallbacks. To theme: define `--pg-ink`,
`--pg-shell`, `--pg-border`, `--pg-subtle`, `--pg-hover`, `--pg-font-sans` on a wrapping element, or
rename the `var(--pg-*, …)` references in `theme/stylesheet.ts` to your own tokens. Dark mode works
automatically if those tokens flip.

> If you're inside the `photon-grove/apps` monorepo, skip the copy and import
> `@photon-grove/react-flow-diagrams` directly — this folder is the source of truth's portable twin.
</content>
