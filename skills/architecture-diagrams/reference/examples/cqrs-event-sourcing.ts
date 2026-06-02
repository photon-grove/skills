// Example DiagramSpec — a hypothetical CQRS / event-sourcing system, included
// only to show the data shape. In a real app you'd import the type from wherever
// you dropped the toolkit, e.g. `import type {DiagramSpec} from '@/lib/diagrams'`.
// Here it points at the bundled reference copy.
import type {DiagramSpec} from '../src/types'

/**
 * A made-up CQRS split: an event-sourced write model on the left, a denormalized
 * read model on the right, with inline projection and a replay path. The point
 * is the *shape*, not the system — swap in your own nodes and edges.
 *
 * Note how the spec carries *meaning*, not coordinates:
 *  - `kind` picks the component/shape, `domain` picks the color (kept orthogonal).
 *  - `parent` nests nodes inside a `boundary`; ELK sizes the boundary.
 *  - every node has a short `sublabel` so the card is self-explaining.
 *  - edge `variant` encodes the relationship and drives the legend.
 */
export const cqrsEventSourcing: DiagramSpec = {
  id: 'cqrs-event-sourcing',
  title: 'CQRS & event sourcing',
  group: 'Patterns',
  description:
    'A command mutates an event-sourced aggregate; events are appended to a log, fan out over a topic, and are projected into a read model the query side serves. A separate indexer rebuilds a search index from the same events, and a replay job can rebuild the read model from the log.',
  layout: {direction: 'RIGHT'},
  nodes: [
    {id: 'write', kind: 'boundary', label: 'Write model', domain: 'api'},
    {
      id: 'cmd',
      kind: 'process',
      label: 'Command handler',
      sublabel: 'validates + executes',
      domain: 'api',
      icon: 'process',
      parent: 'write',
    },
    {
      id: 'agg',
      kind: 'service',
      label: 'Aggregate',
      sublabel: 'applies + emits events',
      domain: 'domain',
      icon: 'gear',
      parent: 'write',
    },
    {
      id: 'eventlog',
      kind: 'datastore',
      label: 'Event log',
      sublabel: 'append-only',
      domain: 'data',
      icon: 'datastore',
      parent: 'write',
    },

    {id: 'stream', kind: 'process', label: 'Change stream', domain: 'event', icon: 'event'},
    {
      id: 'publisher',
      kind: 'service',
      label: 'Event publisher',
      sublabel: 'batched + retry',
      domain: 'event',
      icon: 'topic',
    },
    {
      id: 'topic',
      kind: 'topic',
      label: 'Events',
      sublabel: 'pub/sub fan-out',
      domain: 'event',
      icon: 'topic',
    },

    {id: 'read', kind: 'boundary', label: 'Read model', domain: 'data'},
    {
      id: 'project',
      kind: 'process',
      label: 'Projector',
      sublabel: 'builds read views',
      domain: 'data',
      icon: 'process',
      parent: 'read',
    },
    {
      id: 'views',
      kind: 'datastore',
      label: 'Read views',
      sublabel: 'query-optimized',
      domain: 'data',
      icon: 'datastore',
      parent: 'read',
    },
    {
      id: 'indexer',
      kind: 'service',
      label: 'Search indexer',
      sublabel: 'rebuilds index',
      domain: 'ingestion',
      icon: 'gear',
    },
    {
      id: 'searchidx',
      kind: 'datastore',
      label: 'Search index',
      sublabel: 'full-text',
      domain: 'data',
      icon: 'search',
    },

    {
      id: 'replay',
      kind: 'process',
      label: 'Replay job',
      sublabel: 'rebuild from log',
      domain: 'ingestion',
      icon: 'gear',
    },
    {
      id: 'queryapi',
      kind: 'service',
      label: 'Query API',
      sublabel: 'serves read side',
      domain: 'api',
      icon: 'service',
    },
  ],
  edges: [
    {id: 'cmd-agg', source: 'cmd', target: 'agg', variant: 'data'},
    {id: 'agg-log', source: 'agg', target: 'eventlog', variant: 'event', label: 'append events'},
    {id: 'agg-project', source: 'agg', target: 'project', variant: 'data', label: 'inline'},
    {id: 'project-views', source: 'project', target: 'views', variant: 'data'},
    {id: 'log-stream', source: 'eventlog', target: 'stream', variant: 'event'},
    {id: 'stream-pub', source: 'stream', target: 'publisher', variant: 'event'},
    {id: 'pub-topic', source: 'publisher', target: 'topic', variant: 'event'},
    {
      id: 'topic-indexer',
      source: 'topic',
      target: 'indexer',
      variant: 'async',
      label: 'subscribe',
    },
    {id: 'indexer-search', source: 'indexer', target: 'searchidx', variant: 'data', label: 'rebuild'},
    {
      id: 'search-query',
      source: 'searchidx',
      target: 'queryapi',
      variant: 'data',
      label: 'full-text read',
    },
    {id: 'log-replay', source: 'eventlog', target: 'replay', variant: 'dependency', label: 'replay'},
    {id: 'replay-views', source: 'replay', target: 'views', variant: 'data'},
    {id: 'views-query', source: 'views', target: 'queryapi', variant: 'data', label: 'read'},
  ],
}
</content>
