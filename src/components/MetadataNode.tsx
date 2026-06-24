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
  isHub: boolean; // selected focus node
  dotSize: number; // owned by GraphCanvas so edges can anchor to the same value
}

function MetadataNodeView({ data }: NodeProps) {
  const { meta, degree, selected, highlighted, dimmed, dotSize } = data as MetadataNodeData;
  const style = CATEGORY_STYLES[meta.category];

  // Size is owned by GraphCanvas (single source of truth shared with edge anchoring).
  const size = dotSize;

  const opacity = dimmed ? 0.18 : 1;
  const ring = selected
    ? '#ffffff'
    : highlighted
      ? style.color
      : 'transparent';

  const isDomain = meta.category === 'Business Domain';
  const dotBg = isDomain
    ? `radial-gradient(circle at 35% 30%, #c4b5fd, ${style.color} 60%, #6d28d9)`
    : `radial-gradient(circle at 35% 30%, #ffffff22, ${style.color})`;

  return (
    <div
      className="flex flex-col items-center select-none"
      style={{ opacity, transition: 'opacity 160ms ease' }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 1, height: 1, border: 'none', left: '50%', top: '50%' }}
        isConnectable={false}
      />
      <div className="relative" style={{ width: size, height: size }}>
        {/* glow halo */}
        <div
          className={highlighted || selected ? 'halo-pulse' : ''}
          style={{
            position: 'absolute',
            inset: -size * 0.55,
            borderRadius: '9999px',
            background: style.glow,
            filter: 'blur(8px)',
            opacity: selected ? 0.9 : highlighted ? 0.7 : 0.4,
          }}
        />
        {/* dot */}
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '9999px',
            background: dotBg,
            boxShadow: `0 0 0 1.5px ${ring}, 0 2px 8px rgba(0,0,0,0.6)`,
            border: `1px solid ${style.color}aa`,
          }}
        />
        {/* degree badge */}
        {degree > 0 && meta.category !== 'Column' && (
          <span
            style={{
              position: 'absolute',
              top: -8,
              right: -10,
              fontSize: 9,
              lineHeight: '14px',
              minWidth: 14,
              height: 14,
              padding: '0 3px',
              textAlign: 'center',
              borderRadius: 7,
              background: '#0d1320',
              border: `1px solid ${style.color}88`,
              color: style.color,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
            }}
          >
            {degree}
          </span>
        )}
      </div>

      {/* label pill */}
      <div
        style={{
          marginTop: 8,
          maxWidth: 168,
          padding: '3px 9px',
          borderRadius: 7,
          background: selected ? style.color : 'rgba(13,19,32,0.92)',
          border: `1px solid ${selected ? style.color : highlighted ? style.color + '66' : '#1d2740'}`,
          color: selected ? '#06121a' : highlighted ? '#eef3fb' : '#aab6d0',
          fontSize: meta.category === 'Column' ? 10 : 11.5,
          fontWeight: selected ? 700 : 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          boxShadow: selected ? `0 4px 14px ${style.glow}` : 'none',
        }}
        title={meta.label}
      >
        {meta.label}
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
