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

function dotAnchor(node: InternalNode<Node>) {
  const { x, y } = node.internals.positionAbsolute;
  const w = node.measured?.width ?? 40;
  const dotSize = (node.data?.dotSize as number | undefined) ?? 22;
  // Dot sits at the top-center of the node wrapper; anchor edges to its center.
  return { x: x + w / 2, y: y + dotSize / 2 };
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

  const sc = dotAnchor(sourceNode);
  const tc = dotAnchor(targetNode);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sc.x,
    sourceY: sc.y,
    targetX: tc.x,
    targetY: tc.y,
    sourcePosition: relativePosition(sc, tc),
    targetPosition: relativePosition(tc, sc),
    curvature: 0.28,
  });

  const highlighted = edgeData.highlighted;

  // Rotate the label to follow the edge, but keep it upright (flip past vertical).
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
          strokeWidth: highlighted ? 2 : 1.1,
          strokeDasharray: relStyle.dashed ? '5 5' : undefined,
          opacity: highlighted ? 0.95 : 0.35,
          transition: 'opacity 160ms ease, stroke-width 160ms ease',
        }}
      />
      {edgeData.showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px) rotate(${angle}deg)`,
              pointerEvents: 'none',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.02em',
              padding: '2px 7px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
              background: highlighted ? '#0f1830' : 'rgba(11,17,30,0.82)',
              border: `1px solid ${highlighted ? relStyle.color + 'aa' : '#1d2740'}`,
              color: highlighted ? relStyle.color : '#6b779a',
              opacity: highlighted ? 1 : 0.85,
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
