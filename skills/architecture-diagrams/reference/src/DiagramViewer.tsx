import {useMemo, useState, type ReactElement} from 'react'

import {ClientOnly} from './ClientOnly'
import {DiagramCanvas} from './DiagramCanvas'
import {Legend} from './Legend'
import {RFD_STYLESHEET} from './theme/stylesheet'
import type {DiagramSpec} from './types'

const UNGROUPED = '__ungrouped__'

interface DiagramGroup {
  group: string
  diagrams: DiagramSpec[]
}

function groupDiagrams(diagrams: DiagramSpec[]): DiagramGroup[] {
  const order: string[] = []
  const map = new Map<string, DiagramSpec[]>()
  for (const diagram of diagrams) {
    const key = diagram.group ?? UNGROUPED
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)?.push(diagram)
  }
  return order.map((group) => ({group, diagrams: map.get(group) ?? []}))
}

/**
 * The full `/docs`-style experience: a sidebar picker plus the selected
 * diagram canvas and its legend. Supply `diagrams`; everything else (layout,
 * styling, theming) is handled by the toolkit.
 */
export function DiagramViewer({
  diagrams,
  title = 'Architecture',
  subtitle,
}: {
  diagrams: DiagramSpec[]
  title?: string
  subtitle?: string
}): ReactElement {
  const [activeId, setActiveId] = useState(diagrams[0]?.id ?? '')
  const active = useMemo(
    () => diagrams.find((diagram) => diagram.id === activeId) ?? diagrams[0],
    [diagrams, activeId]
  )
  const groups = useMemo(() => groupDiagrams(diagrams), [diagrams])

  return (
    <div className="rfd-root rfd-viewer">
      <style dangerouslySetInnerHTML={{__html: RFD_STYLESHEET}} />
      <aside className="rfd-viewer__nav">
        <div className="rfd-viewer__brand">
          <span className="rfd-viewer__brand-title">{title}</span>
          {subtitle ? <span className="rfd-viewer__brand-sub">{subtitle}</span> : null}
        </div>
        {groups.map((group) => (
          <div key={group.group} className="rfd-viewer__group">
            {group.group !== UNGROUPED ? (
              <span className="rfd-viewer__group-title">{group.group}</span>
            ) : null}
            {group.diagrams.map((diagram, index) => (
              <button
                key={diagram.id}
                type="button"
                className={
                  'rfd-viewer__item' +
                  (active?.id === diagram.id ? ' rfd-viewer__item--active' : '')
                }
                onClick={() => setActiveId(diagram.id)}
              >
                <span className="rfd-viewer__item-index">{index + 1}</span>
                <span className="rfd-viewer__item-body">
                  <span className="rfd-viewer__item-title">{diagram.title}</span>
                  {diagram.description ? (
                    <span className="rfd-viewer__item-desc">{diagram.description}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      <main className="rfd-viewer__main">
        {active ? (
          <>
            <header className="rfd-viewer__header">
              <h2 className="rfd-viewer__title">{active.title}</h2>
              {active.description ? <p className="rfd-viewer__desc">{active.description}</p> : null}
            </header>
            <div className="rfd-viewer__canvas">
              <ClientOnly fallback={<div className="rfd-canvas__loading">Loading diagram…</div>}>
                {/* Key by id so switching diagrams fully remounts React Flow:
                    an in-place nodes/edges swap doesn't re-trigger node
                    measurement, leaving edges unanchored. A fresh mount does. */}
                <DiagramCanvas key={active.id} spec={active} />
              </ClientOnly>
            </div>
            <Legend spec={active} />
          </>
        ) : (
          <div className="rfd-canvas__loading">No diagrams to show.</div>
        )}
      </main>
    </div>
  )
}
</content>
