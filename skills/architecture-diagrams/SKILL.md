---
name: architecture-diagrams
description: Build an interactive, layered architecture-diagram docs page (React Flow + ELK auto-layout), portable to TanStack Start, Next.js, or any React app
argument-hint: "[target app path]"
---

# Architecture Diagrams

Build a polished, interactive **architecture diagram docs page** — a sidebar of diagrams, an
auto-laid-out canvas with zoom/pan/minimap, themed nodes, routed edges, and a legend. It is
intentionally framework-agnostic: the rendering toolkit is plain React + two libraries, so the same
code drops into **TanStack Start**, **Next.js (App or Pages Router)**, Vite SPA, Remix, or any
React 18/19 app.

The core idea: **callers only write semantic data** (a list of nodes and edges). The toolkit owns
layout, positioning, styling, and theming. Authoring a new diagram is editing one data file — never
touching coordinates or CSS.

## When to use this skill

- A project needs living architecture docs (system landscape, data flow, CQRS/event sourcing, auth,
  routing, pipeline stages, domain model).
- You want diagrams that **auto-layout** so authors never hand-place boxes.
- You want diagrams checked into the repo as typed data (reviewable in PRs, no external tool).

If you only need a single static picture, a Mermaid block in Markdown is lighter. Reach for this
when you want an interactive, multi-diagram, branded experience that stays maintainable as the
system grows.

## The stack

Two runtime dependencies. Everything else is hand-written and bundled in `reference/`.

| Library | Version | Role |
|---|---|---|
| [`@xyflow/react`](https://reactflow.dev) (React Flow) | `^12.8` | SVG canvas: nodes, edges, zoom/pan, minimap, controls, background |
| [`elkjs`](https://github.com/kieler/elkjs) | `^0.9` | Auto-layout engine (Eclipse Layout Kernel, WASM-free JS build) — computes node positions and orthogonal edge routes |

Peer deps: `react` / `react-dom` (18 or 19). No Tailwind, no CSS framework, no icon package — the
toolkit injects one self-contained stylesheet and ships its own line-icon set.

```sh
npm i @xyflow/react elkjs        # or pnpm add / yarn add
```

> **Why ELK and not React Flow's built-in layout?** React Flow does not lay out graphs — you give it
> positioned nodes. ELK's `layered` algorithm (Sugiyama-style) produces clean left-to-right or
> top-down tiers and, crucially, **orthogonal edge routes with bend points** that bend *around*
> nodes instead of cutting through them. We consume those routes directly. Alternatives: `dagre`
> (simpler, no port routing, edges can overlap nodes), `d3-force` (organic but non-deterministic —
> bad for docs). ELK is the right pick for architecture diagrams.

## How it fits together

```
DiagramSpec (your data)
      │
      ▼
runElkLayout(spec)  ──►  ELK computes node x/y + edge waypoints
      │
      ▼
React Flow  ──►  custom node components (themed) + custom orthogonal edge
      │
      ▼
DiagramViewer  ──►  sidebar picker + header + canvas + legend
```

The bundled toolkit (`reference/src/`) is about a dozen small files. Copy the whole `src/` tree into your
project (e.g. `src/lib/diagrams/` or a local package), then write diagram data files and mount
`<DiagramViewer diagrams={...} />` on a route.

## Quick start (any React app)

1. **Install deps**: `npm i @xyflow/react elkjs`.
2. **Copy the toolkit**: copy `reference/src/` from this skill into your project (keep the folder
   structure — `theme/`, `layout/`, `nodes/`, and the top-level files).
3. **Import React Flow's base stylesheet once, at your app's global entry** (not inside a
   component — see Rendering below):

   ```ts
   import '@xyflow/react/dist/style.css'
   ```

4. **Write a diagram** as a typed `DiagramSpec` data file (see `reference/examples/`).
5. **Register diagrams** in an array and mount the viewer on a **client-rendered** route:

   ```tsx
   import {DiagramViewer} from '@/lib/diagrams'
   import {MY_DIAGRAMS} from '@/features/docs/diagrams'

   export function DocsScreen() {
     return (
       <div style={{position: 'relative', width: '100%', height: 'calc(100dvh - 24px)'}}>
         <DiagramViewer diagrams={MY_DIAGRAMS} title="My System" subtitle="Architecture" />
       </div>
     )
   }
   ```

6. **Give the viewer a real height.** It fills its parent (`height: 100%`), so the wrapper must have
   a concrete height (`100dvh`, a flex child, etc.) or the canvas collapses to 0px.

## The data contract (`DiagramSpec`)

This is the only thing authors (or an LLM) touch. Full types in `reference/src/types.ts`.

```ts
interface DiagramSpec {
  id: string                 // stable key; used to remount the canvas on switch
  title: string
  description?: string       // caption in the header + picker
  group?: string             // sidebar grouping label
  layout?: {direction?: 'RIGHT' | 'DOWN'}  // default RIGHT (left-to-right)
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

interface DiagramNode {
  id: string
  kind: 'service' | 'datastore' | 'queue' | 'topic' | 'external' | 'process' | 'client' | 'boundary'
  label: string
  sublabel?: string          // secondary line (tech, table name, ARN suffix)
  domain?: string            // color bucket — see DOMAIN_PALETTE
  icon?: string              // icon key (see ICONS); falls back to a kind glyph
  parent?: string            // id of a `boundary` node to nest inside
  meta?: Record<string, string>  // up to 3 shown as chips on the card
}

interface DiagramEdge {
  id: string
  source: string             // node id
  target: string             // node id
  label?: string             // routed into the inter-layer gap
  variant?: 'data' | 'request' | 'event' | 'async' | 'dependency'  // default 'data'
  animated?: boolean         // override variant default
}
```

**Authoring rules:**

- `kind` picks the *shape/component*; `domain` picks the *color*. Keep them orthogonal — e.g. a
  `service` node in the `event` domain renders the service card in amber.
- Nest nodes in a `boundary` by setting `parent: '<boundary-id>'`. The boundary is sized by ELK from
  its children — never give it a fixed size.
- Edge `variant` carries meaning (see Edge variants below). Pick the one that matches the
  relationship; the legend explains it to readers automatically.
- Give every node a `sublabel` with the concrete tech/identifier — it's what makes the diagram
  *recognizable* rather than generic boxes.

## Rendering

### Client-only is mandatory

ELK and React Flow both need a real DOM (to measure and to render SVG). They **cannot run during
SSR**. The toolkit gates rendering behind `ClientOnly` (a mount-effect flag); the server and first
paint show a `Loading diagram…` fallback, then the client hydrates the canvas.

Framework specifics:

- **TanStack Start**: the bundled `ClientOnly` is enough — the route component renders normally and
  the canvas defers itself.
- **Next.js App Router**: add `'use client'` at the top of any file that imports the viewer/canvas
  (they use hooks and browser APIs). Either keep `ClientOnly`, or import the viewer via
  `next/dynamic` with `{ssr: false}` and you can drop `ClientOnly`. Doing both is harmless.
- **Next.js Pages Router**: same — `dynamic(() => import('...'), {ssr: false})`.

```tsx
// Next.js App Router page
'use client'
import dynamic from 'next/dynamic'
const DocsScreen = dynamic(() => import('@/features/docs/DocsScreen'), {ssr: false})
export default function Page() { return <DocsScreen /> }
```

### Import React Flow's base stylesheet at the app entry

React Flow ships a base stylesheet (`@xyflow/react/dist/style.css`) that the canvas needs. Import it
**once, from your app's global entry** — the toolkit deliberately does *not* import it inside a
component, because a global CSS import inside a component breaks Next.js builds:

- **Next.js App Router**: `import '@xyflow/react/dist/style.css'` in `app/layout.tsx`.
- **Next.js Pages Router**: import it in `pages/_app.tsx`.
- **TanStack Start / Vite / Remix**: import it in the root route/layout or your app entry (e.g.
  `main.tsx`) — anywhere global is fine since they don't enforce App Router's restriction.

The toolkit's own visual stylesheet (`RFD_STYLESHEET`) is separate and *is* injected automatically
by `DiagramViewer`; only React Flow's base CSS is your responsibility.

### Remount on switch (subtle but important)

`DiagramViewer` renders `<DiagramCanvas key={active.id} spec={active} />`. The `key` forces a **full
remount** when you switch diagrams. An in-place nodes/edges swap does *not* re-trigger React Flow's
node measurement, which leaves edges unanchored (they silently fail to draw). A fresh mount fixes
it. Keep the `key`.

### Seed node sizes so edges have anchors

When building React Flow nodes, set `width`/`height` **on the node object** (not only in `style`).
React Flow seeds its `measured` dimensions from those and computes handle bounds immediately —
without them, edges have no anchor points and don't render until a resize nudges measurement. The
bundled `layout/elk.ts` already does this; preserve it if you refactor.

## Positioning (ELK layout)

All positioning lives in `reference/src/layout/elk.ts`. You normally never edit it — but understand
the knobs.

Key ELK options (on the root graph):

```ts
'elk.algorithm': 'layered',                              // tiered Sugiyama layout
'elk.layered.spacing.nodeNodeBetweenLayers': '130',      // wide gaps so edge LABELS fit in them
'elk.spacing.nodeNode': '64',
'elk.edgeRouting': 'ORTHOGONAL',                         // L-shaped routes with bend points
'elk.edgeLabels.placement': 'CENTER',                    // label sits in the inter-layer gap
'elk.aspectRatio': '1.7',                                // bias away from thin sprawling bands
'elk.hierarchyHandling': 'INCLUDE_CHILDREN',             // enables boundary nesting
'elk.direction': 'RIGHT' | 'DOWN',                       // from spec.layout
```

Three things the layout pass does that are easy to get wrong if you reimplement:

1. **Consume ELK's edge routes.** ELK returns `sections[].startPoint / bendPoints / endPoint`. We
   render edges along *those* waypoints (custom `OrthogonalEdge`), not React Flow's handle-to-handle
   smoothstep. This is what stops edges cutting across unrelated nodes or looping backward.
2. **Translate boundary-local edge coordinates.** With `INCLUDE_CHILDREN`, ELK reports an edge's
   coordinates relative to the **lowest common ancestor boundary** of its two endpoints, not the
   root. An edge between two children of the same boundary comes back in *boundary-local* coords and
   must be shifted by that boundary's absolute origin, or it renders detached. The layout pass walks
   the tree to compute absolute positions and offsets each edge accordingly.
3. **Nest containers via `parentId` + `extent: 'parent'`.** Children get `parentId` so React Flow
   positions them relative to the boundary, and `extent: 'parent'` keeps them clipped inside.

Fixed node sizes per kind live in `theme/tokens.ts` (`NODE_SIZE`) — e.g. `service` is 248×96.
Boundaries are *not* fixed; ELK sizes them from their children plus padding.

## Styling

One self-contained stylesheet (`theme/stylesheet.ts`, the `RFD_STYLESHEET` string) is injected once
by the viewer via `<style>`. No Tailwind needed. It is built around **CSS custom properties** so it
themes cleanly and supports dark mode without a single dark-mode branch.

### Theme via CSS variables

The stylesheet reads host theme tokens with standalone fallbacks:

```css
--rfd-ink:    var(--app-ink, #0f172a);     /* text */
--rfd-card:   var(--app-surface, #ffffff); /* node background */
--rfd-border: var(--app-border, rgba(100,116,139,0.22));
--rfd-edge:   var(--app-subtle, #64748b);  /* default edge */
```

**Portability:** the `--app-*` names are placeholder host tokens you map to whatever design system
the app already uses. Either (a) define `--app-ink`, `--app-muted`, `--app-surface`, `--app-border`,
`--app-subtle`, `--app-hover`, `--app-font-sans` (and optionally `--app-accent`) on a wrapping
element, or (b) rename the `var(--app-*, …)` references in `stylesheet.ts` to your own token names. The hard-coded fallbacks
mean it looks correct out of the box even with no tokens defined. Dark mode "just works" if your
tokens flip — the layout uses `color-mix(...)` against `--rfd-ink`/`--rfd-card` rather than fixed
light colors.

### Node anatomy

Each leaf node is: a 3px accent **bar**, an **icon chip** (32×32, accent-tinted), a **title**, an
optional **sublabel**, and up to three **meta chips**. The per-node accent comes from `domain`:
each node sets inline `--rfd-accent` / `--rfd-soft` from the palette, and the CSS derives the bar,
icon chip, gradient header, hover ring, and border from that single accent via `color-mix`.

### Domain palette (color coding)

`theme/tokens.ts` → `DOMAIN_PALETTE` maps a domain to `{accent, soft}`. Built-in buckets:

`web, client, api, auth, ingestion, planner, ai, data, queue, event, external, observability,
domain`. Unknown domains fall back to neutral slate. Add or recolor buckets by editing this one map
— pick accents that read on both light and dark surfaces, and a translucent `soft` (the icon-chip
fill and gradient).

### Edge variants

`theme/tokens.ts` → `EDGE_STYLE` defines five semantic edge styles:

| Variant | Look | Meaning |
|---|---|---|
| `data` | solid, muted | synchronous data flow (default) |
| `request` | solid, accent | request/response call |
| `event` | solid, amber, **animated** | emitted event / stream record |
| `async` | dashed, amber, animated | async hand-off through a queue |
| `dependency` | dotted, no arrowhead | soft dependency / reference |

Edge labels render as an opaque bordered chip so they stay legible even when they land near another
edge. Arrowheads use `MarkerType.ArrowClosed` (omitted for `dependency`).

### Legend

`Legend` auto-derives its contents from the active spec — it lists **only** the domains, node kinds,
and edge variants actually present in that diagram, so each legend stays relevant. Nothing to
maintain by hand.

## Authoring a diagram set (recommended layout)

```
features/docs/
  DocsScreen.tsx               # mounts <DiagramViewer diagrams={ALL} ... />
  diagrams/
    index.ts                   # export const ALL: DiagramSpec[] = [a, b, c, ...]
    01-system-landscape.ts     # one DiagramSpec per file, numbered for order
    02-...
```

- Order diagrams semantically: overview → architecture patterns → specific tiers.
- Use `group` to bucket them in the sidebar (`'Architecture'`, `'Web'`, `'Data'`).
- Keep each spec to ~10–25 nodes. If it's bigger, split it — a diagram nobody can read at a glance
  has failed its job.
- See `reference/examples/cqrs-event-sourcing.ts` for a complete, idiomatic spec (boundaries,
  nesting, all five edge variants, meaningful sublabels).

## Build checklist

When standing this up in a project:

1. `npm i @xyflow/react elkjs` (confirm React 18/19 present).
2. Copy `reference/src/` into the project.
3. Import `@xyflow/react/dist/style.css` once at your app's global entry (root layout / `_app` /
   app entry — see Rendering). Don't import it inside a component.
4. Decide theming: define `--app-*` tokens on a wrapper, or rename to your tokens in
   `stylesheet.ts`. Confirm light/dark both read well.
5. Write 1 diagram, mount `<DiagramViewer>` on a **client** route with a real height.
6. Verify: canvas renders, you can pan/zoom, edges route around nodes, labels sit in gaps, the
   minimap colors match domains, switching diagrams redraws cleanly.
7. Add the rest of the diagrams as data files; register in the index array.
8. Update the app's docs/README index to point at the new docs route.

## Pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Blank / 0-height canvas | Viewer parent has no height | Give the wrapper a concrete height (`100dvh`, flex child) |
| `window is not defined` / hydration error | Rendered during SSR | Keep `ClientOnly`, or `next/dynamic({ssr:false})` in Next.js |
| Edges don't draw | Nodes lack measured size | Set `width`/`height` on the node object, not just `style` (bundled layout does this) |
| Edges cut through nodes | Not consuming ELK routes | Use the custom `OrthogonalEdge` + route data from `runElkLayout` |
| Boundary-internal edge floats away from its nodes | Boundary-local coords not translated | Offset edge waypoints by the lowest-common-ancestor boundary origin (bundled layout does this) |
| Stale/unanchored edges after switching diagrams | Canvas reused, not remounted | Key the canvas by `spec.id` |
| Colors look wrong in dark mode | Host tokens missing/not flipping | Define `--app-*` (or your) tokens that flip with theme; fallbacks are light-only |
| Diagram sprawls into a thin band | Too many sibling nodes in one layer | Group with boundaries; tune `elk.aspectRatio` / split the diagram |

## Reference files

`reference/src/` is a verbatim, framework-agnostic copy of the toolkit — copy it wholesale:

- `index.ts` — public exports
- `types.ts` — the `DiagramSpec` contract (the stable public interface)
- `layout/elk.ts` — ELK layout + route translation → React Flow nodes/edges
- `nodes/nodes.tsx` — themed leaf + boundary node components
- `nodes/edges.tsx` — custom orthogonal edge that follows ELK waypoints
- `theme/tokens.ts` — domain palette, node sizes, edge styles, labels
- `theme/stylesheet.ts` — the single injected stylesheet (CSS-var themed)
- `theme/icons.tsx` — self-contained line-icon set
- `ClientOnly.tsx` — SSR boundary
- `DiagramCanvas.tsx` — single-diagram canvas (ELK → React Flow)
- `DiagramViewer.tsx` — the full sidebar + canvas + legend experience
- `Legend.tsx` — auto-derived legend
- `examples/cqrs-event-sourcing.ts` — a complete example spec to copy from

> If your project already publishes this toolkit as an internal package, import from that package
> instead of copying. The `reference/` copy exists so the skill is self-contained and works in any
> repo with no prior setup.
