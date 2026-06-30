import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useInternalNode,
  Position,
  type EdgeProps,
  type InternalNode,
  type Node,
} from '@xyflow/react';
import type { RelationshipType } from '../types';
import { RELATIONSHIP_STYLES } from '../lib/theme';

export interface MetadataEdgeData extends Record<string, unknown> {
  relationship: RelationshipType;
  highlighted: boolean;
  dim: boolean;
  showLabel: boolean;
}

// Anchor to the center of the rendered card (uses React Flow's measured dimensions).
function cardCenter(node: InternalNode<Node>) {
  const { x, y } = node.internals.positionAbsolute;
  const w = node.measured?.width ?? 220;
  const h = node.measured?.height ?? 68;
  return { x: x + w / 2, y: y + h / 2 };
}

function relativePosition(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Position.Right : Position.Left;
  }
  return dy > 0 ? Position.Bottom : Position.Top;
}

function FloatingEdgeView({ id, source, target, data, markerEnd }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const edgeData = data as MetadataEdgeData;
  const rel = edgeData.relationship;
  const relStyle = RELATIONSHIP_STYLES[rel];

  const sc = cardCenter(sourceNode);
  const tc = cardCenter(targetNode);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sc.x,
    sourceY: sc.y,
    targetX: tc.x,
    targetY: tc.y,
    sourcePosition: relativePosition(sc, tc),
    targetPosition: relativePosition(tc, sc),
    curvature: 0.32,
  });

  const { highlighted, dim, showLabel } = edgeData;

  // Default: very thin and quiet so cards read as primary objects.
  // Highlighted: bright and weighted so connected relationships pop.
  const strokeWidth = highlighted ? 1.8 : 0.9;
  const strokeOpacity = dim ? 0.06 : highlighted ? 0.88 : 0.18;

  // Label angle — keep readable by flipping if angle exceeds 90°.
  let angle = (Math.atan2(tc.y - sc.y, tc.x - sc.x) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: relStyle.color,
          strokeWidth,
          strokeOpacity,
          strokeDasharray: relStyle.dashed ? '5 4' : undefined,
          transition: 'stroke-opacity 200ms ease, stroke-width 200ms ease',
        }}
      />
      {/* Labels only appear when the edge is part of a focused neighborhood */}
      {showLabel && highlighted && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px) rotate(${angle}deg)`,
              pointerEvents: 'none',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.03em',
              padding: '2px 7px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
              background: '#0a0f1c',
              border: `1px solid ${relStyle.color}88`,
              color: relStyle.color,
            }}
          >
            {rel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(FloatingEdgeView);
