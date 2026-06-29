import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { nodeColors } from '../mockGraphData';
import type { NodeData } from '../mockGraphData';

export const NUCLEUS_SIZE = 120;
export const NUCLEUS_RADIUS = NUCLEUS_SIZE / 2;

type GraphNodeProps = NodeProps & { data: NodeData; selected?: boolean };

function GraphNode({ data, selected }: GraphNodeProps) {
  const colors = nodeColors[data.color];

  return (
    <div
      style={{
        width: NUCLEUS_SIZE,
        height: NUCLEUS_SIZE,
        borderRadius: '50%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: `radial-gradient(circle at 38% 32%, ${colors.border}2a 0%, rgba(7,9,16,0.97) 65%)`,
        border: `1.5px solid ${selected ? colors.border : colors.border + '52'}`,
        boxShadow: selected
          ? `0 0 0 2px ${colors.glow}, 0 0 36px ${colors.glow}, 0 0 70px ${colors.border}1a, inset 0 1px 1px rgba(255,255,255,0.10)`
          : `0 0 22px ${colors.border}20, 0 0 7px ${colors.border}12, inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: 'box-shadow 0.4s ease, border-color 0.4s ease, transform 0.35s ease',
        transform: selected ? 'scale(1.09)' : 'scale(1)',
        transformOrigin: 'center center',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 8, height: 8, background: 'transparent', border: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 8, height: 8, background: 'transparent', border: 'none' }}
      />

      <span style={{ fontSize: 26, lineHeight: 1, marginBottom: 2 }}>{data.icon}</span>

      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: selected ? colors.border : `${colors.border}bb`,
          letterSpacing: '0.05em',
          lineHeight: 1,
          transition: 'color 0.35s',
        }}
      >
        {data.label}
      </span>

      <span
        style={{
          fontSize: 8,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}
      >
        {data.subtitle}
      </span>
    </div>
  );
}

export default memo(GraphNode);
