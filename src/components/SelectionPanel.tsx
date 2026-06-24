import type { MetadataEdge, MetadataNode } from '../types';
import { CATEGORY_STYLES } from '../lib/theme';
import { explainLineage, getNeighborhood } from '../lib/lineage';

interface SelectionPanelProps {
  node: MetadataNode | null;
  edges: MetadataEdge[];
  byId: Map<string, MetadataNode>;
  onSelectNode: (id: string) => void;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-line-soft">
      <span className="text-[11px] text-ink-dim shrink-0">{label}</span>
      <span className="text-[12px] text-ink text-right font-mono">{value}</span>
    </div>
  );
}

function Flag({ label, on }: { label: string; on?: boolean }) {
  return (
    <span
      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
        on
          ? 'text-rose-300 border-rose-400/40 bg-rose-400/10'
          : 'text-ink-faint border-line bg-panel-2'
      }`}
    >
      {label}: {on ? 'Y' : 'N'}
    </span>
  );
}

function critColor(c?: string) {
  switch (c) {
    case 'Critical':
      return '#fb7185';
    case 'High':
      return '#f59e0b';
    case 'Medium':
      return '#60a5fa';
    default:
      return '#94a3b8';
  }
}

export default function SelectionPanel({
  node,
  edges,
  byId,
  onSelectNode,
}: SelectionPanelProps) {
  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-ink-dim">
        <div className="w-12 h-12 rounded-full border border-line grid place-items-center mb-3 text-ink-faint">
          ◎
        </div>
        <p className="text-[13px] text-ink mb-1">No node selected</p>
        <p className="text-[12px] leading-relaxed text-ink-dim">
          Click any node to inspect its metadata and trace upstream and downstream lineage.
          Try <span className="text-teal-300 font-mono">Hierarchy_Base_Table</span>.
        </p>
      </div>
    );
  }

  const style = CATEGORY_STYLES[node.category];
  const { upstream, downstream } = getNeighborhood(node.id, edges);
  const explanation = explainLineage(node, edges, byId);

  // Grouped connected nodes for quick navigation.
  const connections = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const other = byId.get(otherId);
      const direction =
        e.source === node.id ? 'out' : ('in' as 'in' | 'out');
      return { rel: e.relationship, other, direction, edgeId: e.id };
    })
    .filter((c) => c.other);

  return (
    <div className="flex-1 overflow-y-auto thin-scroll px-4 py-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span
          className="w-9 h-9 rounded-lg grid place-items-center text-base shrink-0"
          style={{ background: `${style.color}1f`, border: `1px solid ${style.color}66`, color: style.color }}
        >
          {style.glyph}
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink leading-tight break-words">
            {node.label}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10.5px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: `${style.color}1a`, color: style.color }}
            >
              {node.category}
            </span>
            {node.type && node.type !== node.category && (
              <span className="text-[11px] text-ink-dim font-mono">{node.type}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {node.description && (
        <p className="text-[12px] leading-relaxed text-ink-dim mb-4">{node.description}</p>
      )}

      {/* Lineage counts */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg border border-line bg-panel-2 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint mb-0.5">
            Upstream
          </div>
          <div className="text-[20px] font-semibold text-ink font-mono leading-none">
            {upstream.size}
          </div>
          <div className="text-[10px] text-ink-dim mt-1">feeds in</div>
        </div>
        <div className="rounded-lg border border-line bg-panel-2 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint mb-0.5">
            Downstream
          </div>
          <div className="text-[20px] font-semibold text-ink font-mono leading-none">
            {downstream.size}
          </div>
          <div className="text-[10px] text-ink-dim mt-1">flows out</div>
        </div>
      </div>

      {/* Explain lineage */}
      <div
        className="rounded-lg border px-3 py-3 mb-4"
        style={{ borderColor: `${style.color}40`, background: `${style.color}0d` }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span style={{ color: style.color }} className="text-[12px]">✦</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: style.color }}>
            Explain lineage
          </span>
        </div>
        <p className="text-[12px] leading-relaxed text-ink">{explanation}</p>
      </div>

      {/* Metadata */}
      <div className="mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim mb-1">
          Metadata
        </h3>
        <Field label="Domain" value={node.domain} />
        <Field label="System" value={node.system} />
        <Field label="Database" value={node.database} />
        <Field label="Schema" value={node.schema} />
        <Field label="Owner" value={node.owner} />
        <Field label="Refresh cadence" value={node.refreshCadence} />
        <Field
          label="Criticality"
          value={
            node.criticality ? (
              <span style={{ color: critColor(node.criticality) }}>{node.criticality}</span>
            ) : undefined
          }
        />
        <Field label="Status" value={node.status} />
        <Field
          label="Row count"
          value={node.rowCount !== undefined ? node.rowCount.toLocaleString() : undefined}
        />
        <Field
          label="Data quality"
          value={node.dataQualityScore !== undefined ? `${node.dataQualityScore} / 100` : undefined}
        />
        <Field label="Last refresh" value={node.lastRefresh} />
      </div>

      {/* Flags */}
      {(node.pii !== undefined || node.sensitive !== undefined) && (
        <div className="flex gap-2 mb-4">
          <Flag label="PII" on={node.pii} />
          <Flag label="Sensitive" on={node.sensitive} />
        </div>
      )}

      {/* Connections */}
      {connections.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim mb-1.5">
            Connections ({connections.length})
          </h3>
          <div className="space-y-1">
            {connections.map((c) => (
              <button
                key={c.edgeId}
                onClick={() => onSelectNode(c.other!.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-panel-2 text-left transition-colors group"
              >
                <span
                  className="text-[9px] font-mono px-1 py-0.5 rounded shrink-0 w-[68px] text-center"
                  style={{
                    background: `${CATEGORY_STYLES[c.other!.category].color}1a`,
                    color: CATEGORY_STYLES[c.other!.category].color,
                  }}
                >
                  {c.direction === 'out' ? '→' : '←'} {c.rel}
                </span>
                <span className="text-[12px] text-ink-dim group-hover:text-ink truncate">
                  {c.other!.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
