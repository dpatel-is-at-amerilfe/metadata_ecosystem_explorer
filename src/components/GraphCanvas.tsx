import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
import { getNeighborhood } from '../lib/lineage';
import MetadataNodeView, { type MetadataNodeData } from './MetadataNode';
import FloatingEdge, { type MetadataEdgeData } from './FloatingEdge';

const nodeTypes = { metadata: MetadataNodeView };
const edgeTypes = { floating: FloatingEdge };

// Golden-ratio phase spread — each node breathes at a different point in the cycle.
const PHI = 1.6180339887;

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
  const rf = useReactFlow();

  // Hover state is local and transient — never propagates to App.
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hoveredNeighborhood = useMemo(
    () => (hoveredId ? getNeighborhood(hoveredId, edges) : null),
    [hoveredId, edges],
  );

  // Stable ref for base positions (used by click-to-focus camera).
  const basePosRef = useRef<Record<string, XY>>(positions);

  // 120ms delay prevents hover highlights firing on fast mouse sweeps.
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial React Flow node / edge arrays ────────────────────────────────────
  const initialNodes = useMemo<Node<MetadataNodeData>[]>(
    () =>
      nodes.map((n, i) => ({
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
          // Stagger the CSS cardFloat animation so every card breathes independently.
          breatheDelay: (i * PHI * 7) % 7,
        },
      })),
    // Intentionally stable — positions and degree don't change within a session.
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
          showLabel: false, // labels hidden until a node is focused
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ── Node visual-flag sync ─────────────────────────────────────────────────────
  // Selection takes full priority over hover.
  useEffect(() => {
    const activeId = selectedId ?? hoveredId;
    const activeNbr: Neighborhood | null = selectedId ? neighborhood : hoveredNeighborhood;

    setRfNodes((prev) =>
      prev.map((node) => {
        const meta = (node.data as MetadataNodeData).meta;
        let selected = false;
        let highlighted = false;
        let dimmed = false;
        let isHub = false;

        if (activeId) {
          if (node.id === activeId) {
            selected = node.id === selectedId;
            isHub = true;
            highlighted = true;
          } else if (activeNbr?.connected.has(node.id)) {
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
          },
        };
      }),
    );
  }, [
    selectedId,
    hoveredId,
    neighborhood,
    hoveredNeighborhood,
    hiddenCategories,
    searchMatches,
    hasSearch,
    setRfNodes,
  ]);

  // ── Edge visual-flag sync ────────────────────────────────────────────────────
  useEffect(() => {
    const activeId = selectedId ?? hoveredId;
    const activeNbr: Neighborhood | null = selectedId ? neighborhood : hoveredNeighborhood;

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

        if (activeId) {
          if (activeNbr?.connectedEdges.has(edge.id)) {
            highlighted = true;
            showLabel = true;
          } else {
            dim = true;
          }
        } else if (hasSearch) {
          const bothMatch =
            searchMatches.has(edge.source) && searchMatches.has(edge.target);
          if (bothMatch) { highlighted = true; showLabel = true; }
          else dim = true;
        }
        // Default: no labels, edges stay subtle (handled in FloatingEdge defaults).

        return {
          ...edge,
          hidden: relHidden || !!endpointHidden,
          data: { ...data, highlighted, dim, showLabel },
        };
      }),
    );
  }, [
    selectedId,
    hoveredId,
    neighborhood,
    hoveredNeighborhood,
    hiddenRelationships,
    hiddenCategories,
    byId,
    searchMatches,
    hasSearch,
    setRfEdges,
  ]);

  // ── Hover — visual emphasis only, no camera movement ────────────────────────
  const onNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (selectedId) return;
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      enterTimerRef.current = setTimeout(() => {
        enterTimerRef.current = null;
        setHoveredId(node.id);
      }, 120);
    },
    [selectedId],
  );

  const onNodeMouseLeave = useCallback(() => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    setHoveredId(null);
  }, []);

  // ── Click — commit selection + smooth camera focus ───────────────────────────
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelect(node.id);
      const base = basePosRef.current[node.id];
      if (base) {
        rf.setCenter(base.x, base.y, { zoom: 1.1, duration: 600 });
      }
    },
    [onSelect, rf],
  );

  // ── Pane click — clear selection + return to overview ───────────────────────
  const onPaneClick = useCallback(() => {
    onClearSelection();
    rf.fitView({ padding: 0.18, duration: 650 });
  }, [onClearSelection, rf]);

  // When selection changes externally (toolbar reset), also clear any pending hover.
  useEffect(() => {
    if (selectedId) {
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }
      setHoveredId(null);
    }
  }, [selectedId]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      nodesDraggable={false}
      minZoom={0.1}
      maxZoom={2}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: 'floating' }}
    >
      <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#111827" />
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 16,
          opacity: 0.4,
          transition: 'opacity 200ms ease',
          zIndex: 5,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
      >
        <Controls
          showInteractive={false}
          style={{
            background: 'rgba(10,15,28,0.85)',
            border: '1px solid #1d2740',
            borderRadius: 10,
          }}
        />
      </div>
    </ReactFlow>
  );
}
