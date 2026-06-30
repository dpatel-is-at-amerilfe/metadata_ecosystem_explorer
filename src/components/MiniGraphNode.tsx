import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { nodeColors } from '../mockGraphData';
import type { MiniNodeData } from '../mockGraphData';

function MiniGraphNode({ data }: NodeProps & { data: MiniNodeData }) {
  const colors = nodeColors[data.color];
  const isPrimary = data.focusLevel === 'primary';
  const isConnected = data.focusLevel === 'connected';

  const borderAlpha = isPrimary ? '' : isConnected ? 'bb' : '55';
  const textColor = isPrimary ? '#e2e8f0' : isConnected ? '#b8c4d8' : '#8b98b4';
  const boxShadow = isPrimary
    ? `0 0 10px ${colors.glow}, 0 0 3px ${colors.border}66`
    : isConnected
    ? `0 0 6px ${colors.glow}`
    : undefined;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 12px',
        background: isPrimary ? 'rgba(22, 25, 44, 0.98)' : 'rgba(22, 25, 40, 0.95)',
        border: `1px solid ${colors.border}${borderAlpha}`,
        borderRadius: 20,
        whiteSpace: 'nowrap',
        boxShadow,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 6, height: 6 }} />
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: colors.border,
          opacity: isPrimary ? 1 : isConnected ? 0.85 : 0.9,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 17, fontWeight: 500, color: textColor, letterSpacing: '0.05em', transition: 'color 0.3s' }}>
        {data.label}
      </span>
    </div>
  );
}

export default memo(MiniGraphNode);
