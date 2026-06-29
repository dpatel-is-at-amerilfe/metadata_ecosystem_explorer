import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

type GraphEdgeData = { label?: string; isParent?: boolean };
type GraphEdgeProps = EdgeProps & { data?: GraphEdgeData };

function GraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: GraphEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const isParent = data?.isParent;

  // Gravitational tether: faint animated dash that slowly crawls, softly brightens on focus.
  if (isParent) {
    return (
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={selected ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.07)'}
        strokeWidth={selected ? 0.9 : 0.55}
        strokeDasharray="3 10"
        style={{
          animation: 'tether-pulse 5s linear infinite',
          transition: 'stroke 0.5s, stroke-width 0.5s',
          pointerEvents: 'none',
        }}
      />
    );
  }

  // Main entity relationship edges: 3-layer treatment
  const baseOpacity = selected ? 0.88 : 0.13;
  const glowOpacity = selected ? 1 : 0;
  const dashOpacity = selected ? 0.72 : 0;
  const labelOpacity = selected ? 1 : 0;

  return (
    <>
      {/* Soft glow bloom behind the line */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(155,125,255,0.22)"
        strokeWidth={14}
        style={{
          filter: 'blur(5px)',
          opacity: glowOpacity,
          transition: 'opacity 0.45s',
          pointerEvents: 'none',
        }}
      />

      {/* Base line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#8b7ed4"
        strokeWidth={1.4}
        markerEnd={markerEnd}
        style={{
          opacity: baseOpacity,
          transition: 'opacity 0.35s',
          pointerEvents: 'none',
        }}
      />

      {/* Traveling dash — slow, elegant pulse along the path */}
      <path
        d={edgePath}
        fill="none"
        stroke="#c4b5fd"
        strokeWidth={1.4}
        style={{
          strokeDasharray: '6 32',
          animation: 'edge-flow 3.5s linear infinite',
          opacity: dashOpacity,
          transition: 'opacity 0.45s',
          pointerEvents: 'none',
        }}
      />

      {/* Relationship label — invisible until edge is focused */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              opacity: labelOpacity,
              transition: 'opacity 0.4s',
            }}
            className="nodrag nopan"
          >
            <span
              style={{
                display: 'block',
                fontSize: 9,
                fontFamily: 'monospace',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 20,
                background: 'rgba(139,126,212,0.20)',
                border: '1px solid rgba(167,139,250,0.38)',
                color: '#c4b5fd',
                backdropFilter: 'blur(8px)',
                whiteSpace: 'nowrap',
              }}
            >
              {data.label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(GraphEdge);
