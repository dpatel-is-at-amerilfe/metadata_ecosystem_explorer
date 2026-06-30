import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MetadataNode } from '../types';
import { CATEGORY_STYLES } from '../lib/theme';

export interface MetadataNodeData extends Record<string, unknown> {
  meta: MetadataNode;
  degree: number;
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  isHub: boolean;
  breatheDelay: number; // CSS animation-delay offset (seconds, negative to start mid-cycle)
}

// Card widths — columns are compact; all other nodes are full-width entity cards.
function cardWidth(meta: MetadataNode) {
  if (meta.category === 'Column') return 148;
  if (meta.category === 'Database' || meta.category === 'Schema') return 168;
  return 220;
}

// Render up to two compact metadata pills beneath the label.
function metaBadges(meta: MetadataNode, color: string) {
  const badges: string[] = [];

  if (meta.criticality) badges.push(meta.criticality);
  if (meta.status && meta.status !== 'Active') badges.push(meta.status);
  if (meta.rowCount != null) {
    const n = meta.rowCount;
    badges.push(n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(n));
  }
  if (meta.refreshCadence && badges.length < 2) badges.push(meta.refreshCadence.replace(/^Daily\s*/, 'Daily '));
  if (meta.pii && badges.length < 2) badges.push('PII');

  return badges.slice(0, 2).map((b, i) => (
    <span
      key={i}
      style={{
        fontSize: 9,
        fontWeight: 500,
        padding: '1px 6px',
        borderRadius: 4,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {b}
    </span>
  ));
}

function MetadataNodeView({ data }: NodeProps) {
  const { meta, selected, highlighted, dimmed, isHub, breatheDelay } =
    data as MetadataNodeData;
  const style = CATEGORY_STYLES[meta.category];
  const isColumn = meta.category === 'Column';
  const width = cardWidth(meta);

  // Opacity: dimmed nodes fade into the background.
  const opacity = dimmed ? 0.14 : 1;

  // Card border color reflects interaction state.
  const borderColor = selected
    ? style.color
    : highlighted
      ? `${style.color}88`
      : '#1d2740';

  // Outer glow when selected or highlighted.
  const boxShadow = selected
    ? `0 0 0 1px ${style.color}, 0 0 24px ${style.glow}, 0 8px 32px rgba(0,0,0,0.6)`
    : highlighted
      ? `0 0 0 1px ${style.color}55, 0 0 12px ${style.glow.replace('0.55', '0.35')}, 0 4px 16px rgba(0,0,0,0.5)`
      : '0 4px 20px rgba(0,0,0,0.45)';

  const badges = isColumn ? null : metaBadges(meta, style.color);
  const hasBadges = badges && badges.length > 0;

  return (
    <div
      className="card-float select-none"
      style={{
        opacity,
        transition: 'opacity 200ms ease',
        animationDelay: `${-breatheDelay}s`,
        cursor: 'pointer',
      }}
    >
      {/* Invisible handles centered on card for edge routing */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 1, height: 1, border: 'none', left: '50%', top: '50%' }}
        isConnectable={false}
      />

      {/* ── Card shell ─────────────────────────────────────── */}
      <div
        style={{
          width,
          background: selected ? `${style.color}14` : '#0d1320',
          border: `1px solid ${borderColor}`,
          borderRadius: 10,
          boxShadow,
          overflow: 'hidden',
          transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
          display: 'flex',
        }}
      >
        {/* Left accent stripe — category color */}
        <div
          style={{
            width: 3,
            background: isHub ? style.color : `${style.color}cc`,
            flexShrink: 0,
            transition: 'background 180ms ease',
          }}
        />

        {/* Card content */}
        <div style={{ flex: 1, padding: isColumn ? '7px 10px' : '10px 12px' }}>
          {/* Header row: glyph + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: isColumn ? 9 : 11,
                color: style.color,
                opacity: 0.85,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {style.glyph}
            </span>
            <span
              style={{
                fontSize: isColumn ? 11 : 12.5,
                fontWeight: 600,
                color: selected
                  ? '#eef3fb'
                  : highlighted
                    ? '#d8e2f4'
                    : '#b8c6df',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.01em',
                transition: 'color 180ms ease',
              }}
              title={meta.label}
            >
              {meta.label}
            </span>
          </div>

          {/* Subtitle: type */}
          {meta.type && !isColumn && (
            <div
              style={{
                marginTop: 3,
                fontSize: 10,
                color: '#4e6080',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '0.01em',
              }}
            >
              {meta.type}
            </div>
          )}

          {/* Column: data type as subtitle */}
          {isColumn && meta.type && (
            <div style={{ marginTop: 2, fontSize: 9.5, color: '#3a526a', fontFamily: 'monospace' }}>
              {meta.type}
            </div>
          )}

          {/* Metadata badges row */}
          {hasBadges && (
            <div style={{ display: 'flex', gap: 4, marginTop: 7, flexWrap: 'wrap' }}>
              {badges}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 1, height: 1, border: 'none', left: '50%', top: '50%' }}
        isConnectable={false}
      />
    </div>
  );
}

export default memo(MetadataNodeView);
