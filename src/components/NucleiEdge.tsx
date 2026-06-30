import { memo, useState } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export type NucleiEdgeData = {
  edgeType: 'intra' | 'inter';
  relationship: string;
  sourceRadius: number;
  targetRadius: number;
};

type NucleiEdgeProps = EdgeProps & { data: NucleiEdgeData };

function NucleiEdge({ sourceX, sourceY, targetX, targetY, data }: NucleiEdgeProps) {
  const [hovered, setHovered] = useState(false);

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) return null;

  const ux = dx / dist;
  const uy = dy / dist;

  const x1 = sourceX + ux * data.sourceRadius;
  const y1 = sourceY + uy * data.sourceRadius;
  const x2 = targetX - ux * data.targetRadius;
  const y2 = targetY - uy * data.targetRadius;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const isInter = data.edgeType === 'inter';

  if (isInter) {
    return (
      <>
        {/* transparent wide hit area */}
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="transparent"
          strokeWidth={12}
          style={{ cursor: 'default' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
        {/* visible dashed faded line */}
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#7788aa"
          strokeWidth={1}
          opacity={hovered ? 0.4 : 0.18}
          strokeDasharray="6 5"
          pointerEvents="none"
          style={{ transition: 'opacity 0.2s' }}
        />
        {hovered && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
                background: 'rgba(8,8,16,0.93)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 10,
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            >
              {data.relationship}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }

  // intra: solid bright teal line
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#5eead4"
      strokeWidth={1.5}
      opacity={0.88}
      pointerEvents="none"
    />
  );
}

export default memo(NucleiEdge);
