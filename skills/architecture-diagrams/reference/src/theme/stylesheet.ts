/**
 * One self-contained stylesheet for the whole toolkit. Injected once by the
 * viewer so the package needs no Tailwind or external CSS in the consuming app.
 * Theme-derived colors read host `--app-*` CSS vars (set by your app's theme
 * provider, if any) with safe standalone fallbacks.
 *
 * PORTABILITY: to theme this in your app, either define `--app-ink`,
 * `--app-surface`, `--app-border`, `--app-subtle`, `--app-hover`,
 * `--app-font-sans` (and optionally `--app-accent`) on a wrapping element, or
 * rename the `var(--app-*, …)` references below to whatever design tokens you
 * already use. The hard-coded fallbacks make it render correctly with no tokens
 * at all, and dark mode works automatically if your tokens flip.
 */
export const RFD_STYLESHEET = `
.rfd-root {
  --rfd-ink: var(--app-ink, #0f172a);
  --rfd-muted: var(--app-muted, rgba(15,23,42,0.62));
  --rfd-card: var(--app-surface, #ffffff);
  --rfd-border: var(--app-border, rgba(100,116,139,0.22));
  --rfd-canvas: color-mix(in srgb, var(--app-ink, #0f172a) 5%, var(--app-surface, #ffffff));
  --rfd-edge: var(--app-subtle, #64748b);
  --rfd-edge-strong: var(--app-accent, #818cf8);
  --rfd-edge-muted: color-mix(in srgb, var(--app-ink, #64748b) 38%, transparent);
  --rfd-handle-ring: var(--app-surface, #ffffff);
  width: 100%;
  height: 100%;
}
.rfd-root .react-flow {
  background:
    radial-gradient(125% 90% at 50% -12%, color-mix(in srgb, var(--rfd-edge-strong) 11%, transparent), transparent 58%),
    var(--rfd-canvas);
}
.rfd-node {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rfd-accent) 7%, transparent), transparent 44%),
    var(--rfd-card);
  border: 1px solid color-mix(in srgb, var(--rfd-accent) 22%, var(--rfd-border));
  box-shadow: 0 1px 2px rgba(8,12,28,0.08), 0 16px 30px -16px rgba(8,12,28,0.5);
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.rfd-node:hover {
  border-color: color-mix(in srgb, var(--rfd-accent) 48%, var(--rfd-border));
  box-shadow: 0 2px 6px rgba(8,12,28,0.14), 0 24px 46px -18px rgba(8,12,28,0.62),
              0 0 0 3px color-mix(in srgb, var(--rfd-accent) 15%, transparent);
  transform: translateY(-2px);
}
.rfd-node__bar {
  height: 3px;
  background: linear-gradient(90deg, var(--rfd-accent), color-mix(in srgb, var(--rfd-accent) 28%, transparent) 72%, transparent);
  box-shadow: 0 0 14px -2px var(--rfd-accent);
}
.rfd-node__body { padding: 11px 13px; display: flex; flex-direction: column; gap: 5px; height: calc(100% - 3px); box-sizing: border-box; }
.rfd-node__head { display: flex; align-items: center; gap: 10px; }
.rfd-node__icon {
  width: 32px; height: 32px; border-radius: 10px; flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  color: var(--rfd-accent);
  background: linear-gradient(140deg, color-mix(in srgb, var(--rfd-accent) 28%, transparent), color-mix(in srgb, var(--rfd-accent) 9%, transparent));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--rfd-accent) 32%, transparent);
}
.rfd-node__title { font-weight: 670; font-size: 14px; line-height: 1.2; color: var(--rfd-ink); letter-spacing: -0.01em; }
.rfd-node__sub { font-size: 12px; line-height: 1.3; color: var(--rfd-muted); }
.rfd-node__meta { margin-top: auto; display: flex; flex-wrap: wrap; gap: 4px; padding-top: 2px; }
.rfd-chip {
  font-size: 10px; padding: 2px 7px; border-radius: 999px;
  background: var(--rfd-soft); color: var(--rfd-accent); font-weight: 600;
  white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
}
.rfd-handle {
  /* Anchors React Flow still needs, but the visible line is ELK's routed path,
     which touches the node border wherever ELK chose to attach it. A fixed
     left/right dot next to a top/bottom-entering line reads as detached, so the
     dot is hidden and the path itself is the connection. */
  width: 8px; height: 8px; border-radius: 999px;
  background: var(--rfd-accent); border: 2px solid var(--rfd-handle-ring);
  opacity: 0;
}
.rfd-boundary {
  position: relative; width: 100%; height: 100%; border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--rfd-accent) 34%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--rfd-accent) 9%, transparent), color-mix(in srgb, var(--rfd-accent) 3%, transparent));
}
.rfd-boundary__label {
  position: absolute; top: -11px; left: 16px;
  display: inline-flex; align-items: center;
  padding: 3px 11px; border-radius: 999px;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: #fff;
  background: color-mix(in srgb, var(--rfd-accent) 90%, #000);
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--rfd-accent) 70%, transparent);
}
.rfd-root .react-flow__edge-text { font-size: 11px; font-weight: 600; fill: var(--rfd-ink); }
.rfd-root .react-flow__edge-textbg { fill: var(--rfd-card); opacity: 1; }
.rfd-root .react-flow__controls { box-shadow: 0 6px 18px -8px rgba(10,15,30,0.4); border-radius: 10px; overflow: hidden; }
.rfd-root .react-flow__controls-button { background: var(--rfd-card); border-bottom: 1px solid var(--rfd-border); color: var(--rfd-ink); }
.rfd-root .react-flow__controls-button svg { fill: var(--rfd-ink); }
.rfd-root .react-flow__minimap { border-radius: 10px; overflow: hidden; border: 1px solid var(--rfd-border); }

/* ---- Viewer chrome ---- */
.rfd-viewer {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--rfd-ink);
  font-family: var(--app-font-sans, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
}
.rfd-viewer__nav {
  display: flex; flex-direction: column; gap: 6px;
  padding: 16px 12px; overflow-y: auto;
  border-right: 1px solid var(--rfd-border);
  background: color-mix(in srgb, var(--app-ink, #0f172a) 3%, var(--app-surface, #fff));
}
.rfd-viewer__brand { display: flex; flex-direction: column; gap: 2px; padding: 4px 8px 12px; }
.rfd-viewer__brand-title { font-size: 15px; font-weight: 750; letter-spacing: -0.01em; }
.rfd-viewer__brand-sub { font-size: 11.5px; color: var(--rfd-muted); }
.rfd-viewer__group { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.rfd-viewer__group-title {
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--rfd-muted); padding: 4px 8px;
}
.rfd-viewer__item {
  display: flex; align-items: flex-start; gap: 10px; text-align: left;
  padding: 9px 10px; border-radius: 11px; border: 1px solid transparent;
  background: transparent; cursor: pointer; color: inherit; width: 100%;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.rfd-viewer__item:hover { background: var(--app-hover, rgba(100,116,139,0.1)); }
.rfd-viewer__item--active {
  background: var(--rfd-card);
  border-color: var(--rfd-border);
  box-shadow: 0 8px 22px -14px rgba(10,15,30,0.45);
}
.rfd-viewer__item-index {
  flex: 0 0 auto; width: 22px; height: 22px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  background: var(--rfd-edge-strong); color: #fff;
}
.rfd-viewer__item-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rfd-viewer__item-title { font-size: 13px; font-weight: 620; line-height: 1.2; }
.rfd-viewer__item-desc { font-size: 11px; line-height: 1.3; color: var(--rfd-muted); }
.rfd-viewer__main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.rfd-viewer__header {
  padding: 20px 24px 15px; border-bottom: 1px solid var(--rfd-border);
  background: color-mix(in srgb, var(--app-ink, #0f172a) 2%, var(--app-surface, #fff));
}
.rfd-viewer__title { margin: 0; font-size: 22px; font-weight: 760; letter-spacing: -0.02em; }
.rfd-viewer__desc { margin: 6px 0 0; font-size: 13px; line-height: 1.45; color: var(--rfd-muted); max-width: 76ch; }
.rfd-viewer__canvas { position: relative; flex: 1 1 auto; min-height: 0; }
.rfd-canvas__loading {
  display: flex; align-items: center; justify-content: center; height: 100%;
  color: var(--rfd-muted); font-size: 13px;
}

/* ---- Legend ---- */
.rfd-legend {
  display: flex; flex-wrap: wrap; gap: 8px 26px;
  padding: 12px 22px; border-top: 1px solid var(--rfd-border);
  background: color-mix(in srgb, var(--app-ink, #0f172a) 3%, var(--app-surface, #fff));
}
.rfd-legend__group { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rfd-legend__title {
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--rfd-muted);
}
.rfd-legend__items { display: flex; flex-wrap: wrap; gap: 6px 14px; }
.rfd-legend__item { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--rfd-ink); }
.rfd-legend__swatch { width: 11px; height: 11px; border-radius: 4px; }
.rfd-legend__glyph { display: inline-flex; color: var(--rfd-muted); }

@media (max-width: 760px) {
  .rfd-viewer { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); }
  .rfd-viewer__nav { flex-direction: row; flex-wrap: nowrap; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--rfd-border); }
}
`
