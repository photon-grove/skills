// Example DiagramSpec. In a real app you'd import the type from wherever you
// dropped the toolkit, e.g. `import type {DiagramSpec} from '@/lib/diagrams'`.
// Here it points at the bundled reference copy.
import type {DiagramSpec} from '../src/types'

/**
 * The CQRS split: event-sourced write model on the left, denormalized read
 * model on the right, with inline projection and a replay path.
 *
 * Note how the spec carries *meaning*, not coordinates:
 *  - `kind` picks the component/shape, `domain` picks the color (kept orthogonal).
 *  - `parent` nests nodes inside a `boundary`; ELK sizes the boundary.
 *  - every node has a concrete `sublabel` so the diagram is recognizable.
 *  - edge `variant` encodes the relationship and drives the legend.
 */
export const cqrsEventSourcing: DiagramSpec = {
  id: 'cqrs-event-sourcing',
  title: 'CQRS & event sourcing',
  group: 'Architecture',
  description:
    'Commands mutate event-sourced aggregates; events land in the event-log, fan out via a topic, and materialize inline into the read model that the API queries by exact key. A separate indexer rebuilds a search artifact from the same events.',
  layout: {direction: 'RIGHT'},
  nodes: [
    {id: 'write', kind: 'boundary', label: 'Write model', domain: 'api'},
    {
      id: 'cmd',
      kind: 'process',
      label: 'Command',
      sublabel: 'CommandService.Execute',
      domain: 'api',
      icon: 'process',
      parent: 'write',
    },
    {
      id: 'agg',
      kind: 'service',
      label: 'Aggregate',
      sublabel: 'apply + emit',
      domain: 'domain',
      icon: 'gear',
      parent: 'write',
    },
    {
      id: 'eventlog',
      kind: 'datastore',
      label: 'event-log',
      sublabel: 'pk=stream · sk=seq',
      domain: 'data',
      icon: 'datastore',
      parent: 'write',
    },

    {id: 'stream', kind: 'process', label: 'Change Stream', domain: 'event', icon: 'event'},
    {
      id: 'publisher',
      kind: 'service',
      label: 'publisher',
      sublabel: 'partial-batch + DLQ',
      domain: 'event',
      icon: 'topic',
    },
    {
      id: 'topic',
      kind: 'topic',
      label: 'events',
      sublabel: 'pub/sub fan-out',
      domain: 'event',
      icon: 'topic',
    },

    {id: 'read', kind: 'boundary', label: 'Read model', domain: 'data'},
    {
      id: 'project',
      kind: 'process',
      label: 'Projectors',
      sublabel: 'inline materialize',
      domain: 'data',
      icon: 'process',
      parent: 'read',
    },
    {
      id: 'views',
      kind: 'datastore',
      label: 'entity-views',
      sublabel: 'PK per access pattern',
      domain: 'data',
      icon: 'datastore',
      parent: 'read',
    },
    {
      id: 'searchindexer',
      kind: 'service',
      label: 'search-indexer',
      sublabel: 'queue-triggered rebuild',
      domain: 'ingestion',
      icon: 'lambda',
    },
    {
      id: 'searchidx',
      kind: 'datastore',
      label: 'search-index',
      sublabel: 'FTS artifact',
      domain: 'data',
      icon: 'search',
    },

    {
      id: 'rebuild',
      kind: 'process',
      label: 'rebuild-projections',
      sublabel: 'CLI replay',
      domain: 'ingestion',
      icon: 'gear',
    },
    {
      id: 'queryapi',
      kind: 'service',
      label: 'Query API',
      sublabel: 'ViewQueryService',
      domain: 'api',
      icon: 'lambda',
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
      target: 'searchindexer',
      variant: 'async',
      label: 'filtered queue sub',
    },
    {
      id: 'indexer-search',
      source: 'searchindexer',
      target: 'searchidx',
      variant: 'data',
      label: 'rebuild',
    },
    {id: 'search-query', source: 'searchidx', target: 'queryapi', variant: 'data', label: 'FTS read'},
    {id: 'log-rebuild', source: 'eventlog', target: 'rebuild', variant: 'dependency', label: 'replay'},
    {id: 'rebuild-views', source: 'rebuild', target: 'views', variant: 'data'},
    {id: 'views-query', source: 'views', target: 'queryapi', variant: 'data', label: 'PK query'},
  ],
}
</content>
