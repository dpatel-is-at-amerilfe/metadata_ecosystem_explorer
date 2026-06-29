import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData } from '../mockGraphData';
import { nodeColors } from '../mockGraphData';

type GraphNodeProps = NodeProps & { data: NodeData; selected?: boolean };

function GraphNode({ data, selected }: GraphNodeProps) {
  const colors = nodeColors[data.color];

  return (
    <div
      className="relative rounded-xl"
      style={{
        width: 200,
        background: 'linear-gradient(135deg, #1c1f30 0%, #161826 100%)',
        border: `1.5px solid ${selected ? colors.border : 'rgba(255,255,255,0.13)'}`,
        boxShadow: selected
          ? `0 0 0 1px ${colors.border}44, 0 0 28px ${colors.glow}, 0 4px 24px rgba(0,0,0,0.45)`
          : '0 2px 16px rgba(0,0,0,0.35)',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
        transformOrigin: 'center center',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0, pointerEvents: 'none' }} />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{
              background: `${colors.glow}`,
              border: `1px solid ${colors.border}44`,
            }}
          >
            {data.icon}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm leading-tight truncate">{data.label}</div>
            <div className="text-xs mt-0.5" style={{ color: '#8395b0' }}>{data.subtitle}</div>
          </div>
        </div>

        {data.properties && (
          <div className="space-y-1.5 border-t border-white/5 pt-2.5">
            {Object.entries(data.properties)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: '#68799a' }}>
                    {key}
                  </span>
                  <span className="text-[11px] truncate max-w-[100px]" style={{ color: '#c8d3e8' }}>{value}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="absolute -inset-px rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top left, ${colors.glow} 0%, transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}

export default memo(GraphNode);
