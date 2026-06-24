import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import type {
  MetadataNode,
  MetadataEdge,
  NodeCategory,
  RelationshipType,
} from '../types';
import type { XY } from '../lib/layout';
import type { Neighborhood } from '../lib/lineage';
import { CATEGORY_STYLES } from '../lib/theme';
import MetadataNodeView, { type MetadataNodeData } from './MetadataNode';
import FloatingEdge, { type MetadataEdgeData } from './FloatingEdge';

const nodeTypes = { metadata: MetadataNodeView };
const edgeTypes = { floating: FloatingEdge };

// Single source of truth for dot diameter — MetadataNode renders it and
// FloatingEdge reads node.data.dotSize so the line lands on the dot center.
function dotSizeFor(cat: NodeCategory, isHub: boolean) {
  const base = cat === 'Column' ? 14 : cat === 'Business Domain' ? 30 : 22;
  return isHub ? base + 10 : base;
}

interface GraphCanvasProps {
  nodes: MetadataNode[];
  edges: MetadataEdge[];
  positions: Record<string, XY>;
  byId: Map<string, MetadataNode>;
  degree: Record<string, number>;
  selectedId: string | null;
  neighborhood: Neighborhood | null;
  hiddenCategories: Set<NodeCategory>;
  hiddenRelationships: Set<RelationshipType>;
  searchMatches: Set<string>;
  hasSearch: boolean;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
}

export default function GraphCanvas({
  nodes,
  edges,
  positions,
  byId,
  degree,
  selectedId,
  neighborhood,
  hiddenCategories,
  hiddenRelationships,
  searchMatches,
  hasSearch,
  onSelect,
  onClearSelection,
}: GraphCanvasProps) {
  // Build the React Flow node/edge arrays ONCE. Subsequent updates only touch
  // `.data` and `.hidden`, never `.position`, so user drags are preserved.
  const initialNodes = useMemo<Node<MetadataNodeData>[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: 'metadata',
        position: positions[n.id] ?? { x: 0, y: 0 },
        data: {
          meta: n,
          degree: degree[n.id] ?? 0,
          selected: false,
          highlighted: false,
          dimmed: false,
          isHub: false,
          dotSize: dotSizeFor(n.category, false),
        },
      })),
    // Intentionally run once: positions/degree are stable for the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const initialEdges = useMemo<Edge<MetadataEdgeData>[]>(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'floating',
        data: {
          relationship: e.relationship,
          highlighted: false,
          dim: false,
          showLabel: true,
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Recompute node visual flags whenever selection / search / visibility change.
  useEffect(() => {
    setRfNodes((prev) =>
      prev.map((node) => {
        const meta = (node.data as MetadataNodeData).meta;
        let selected = false;
        let highlighted = false;
        let dimmed = false;
        let isHub = false;

        if (selectedId) {
          if (node.id === selectedId) {
            selected = true;
            isHub = true;
            highlighted = true;
          } else if (neighborhood?.connected.has(node.id)) {
            highlighted = true;
          } else {
            dimmed = true;
          }
        } else if (hasSearch) {
          if (searchMatches.has(node.id)) highlighted = true;
          else dimmed = true;
        }

        return {
          ...node,
          hidden: hiddenCategories.has(meta.category),
          data: {
            ...(node.data as MetadataNodeData),
            selected,
            highlighted,
            dimmed,
            isHub,
            dotSize: dotSizeFor(meta.category, isHub),
          },
        };
      }),
    );
  }, [
    selectedId,
    neighborhood,
    hiddenCategories,
    searchMatches,
    hasSearch,
    setRfNodes,
  ]);

  // Recompute edge visual flags / visibility.
  useEffect(() => {
    setRfEdges((prev) =>
      prev.map((edge) => {
        const data = edge.data as MetadataEdgeData;
        const relHidden = hiddenRelationships.has(data.relationship);
        const src = byId.get(edge.source);
        const tgt = byId.get(edge.target);
        const endpointHidden =
          (src && hiddenCategories.has(src.category)) ||
          (tgt && hiddenCategories.has(tgt.category));

        let highlighted = false;
        let dim = false;
        let showLabel = false;

        if (selectedId) {
          if (neighborhood?.connectedEdges.has(edge.id)) {
            highlighted = true;
            showLabel = true;
          } else {
            dim = true;
          }
        } else if (hasSearch) {
          const bothMatch =
            searchMatches.has(edge.source) && searchMatches.has(edge.target);
          if (bothMatch) {
            highlighted = true;
            showLabel = true;
          } else {
            dim = true;
          }
        } else {
          // Default view mirrors the reference UI: every edge shows its label.
          showLabel = true;
        }

        return {
          ...edge,
          hidden: relHidden || !!endpointHidden,
          data: { ...data, highlighted, dim, showLabel },
        };
      }),
    );
  }, [
    selectedId,
    neighborhood,
    hiddenRelationships,
    hiddenCategories,
    byId,
    searchMatches,
    hasSearch,
    setRfEdges,
  ]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={(_, node) => onSelect(node.id)}
      onPaneClick={onClearSelection}
      minZoom={0.2}
      maxZoom={2.5}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: 'floating' }}
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#16203a" />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) =>
          CATEGORY_STYLES[(n.data as MetadataNodeData).meta.category]?.color ?? '#334155'
        }
        nodeStrokeWidth={0}
        maskColor="rgba(5,8,16,0.78)"
        style={{
          background: '#0a0f1c',
          border: '1px solid #1d2740',
          borderRadius: 10,
        }}
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
