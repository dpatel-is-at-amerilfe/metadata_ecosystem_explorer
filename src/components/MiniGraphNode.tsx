import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { nodeColors } from '../mockGraphData';
import type { MiniNodeData } from '../mockGraphData';

function MiniGraphNode({ data }: NodeProps & { data: MiniNodeData }) {
  const colors = nodeColors[data.color];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 12px',
        background: 'rgba(22, 25, 40, 0.95)',
        border: `1px solid ${colors.border}55`,
        borderRadius: 20,
        whiteSpace: 'nowrap',
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
          opacity: 0.9,
          flexShrink: 0,
        }}
      />
      {/* Mini Node Label */}
      <span style={{ fontSize: 17, fontWeight: 500, color: '#8b98b4', letterSpacing: '0.05em' }}>
        {data.label}
      </span>
    </div>
  );
}

export default memo(MiniGraphNode);
