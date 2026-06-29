import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type NodeChange,
  type EdgeChange,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import MiniGraphNode from './MiniGraphNode';
import { CanvasToolbar } from './CanvasToolbar';
import { mockNodes, mockEdges, miniNodes } from '../mockGraphData';
import type { NodeData } from '../mockGraphData';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const nodeTypes = { graphNode: GraphNode, miniNode: MiniGraphNode };
const edgeTypes = { graphEdge: GraphEdge };

type Props = {
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
};

function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <div
      className="absolute bottom-6 left-4 z-10 flex flex-col gap-1 p-1.5 rounded-xl"
      style={{
        background: 'rgba(13,15,24,0.9)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors"
      >
        <ZoomIn size={13} className="text-slate-400" />
      </button>
      <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto' }} />
      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors"
      >
        <ZoomOut size={13} className="text-slate-400" />
      </button>
      <button
        onClick={() => fitView({ padding: 0.15, duration: 600 })}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors"
      >
        <Maximize2 size={12} className="text-slate-400" />
      </button>
    </div>
  );
}

export default function GraphModelingCanvas({ selectedNodeId, onSelectNode }: Props) {
  const { screenToFlowPosition, getZoom } = useReactFlow();
  const [proximityFocusId, setProximityFocusId] = useState<string | null>(null);
  const [baseNodes, setBaseNodes] = useState(() => [...mockNodes, ...miniNodes]);
  const [extraEdges, setExtraEdges] = useState(mockEdges);

  const activeFocusId = selectedNodeId ?? proximityFocusId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const s = new Set<string>();
    extraEdges.forEach((e) => {
      if (e.source === activeFocusId) s.add(e.target);
      if (e.target === activeFocusId) s.add(e.source);
    });
    return s;
  }, [activeFocusId, extraEdges]);

  const connectedEdgeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const s = new Set<string>();
    extraEdges.forEach((e) => {
      if (e.source === activeFocusId || e.target === activeFocusId) s.add(e.id);
    });
    return s;
  }, [activeFocusId, extraEdges]);

  const nodes = useMemo(() =>
    baseNodes.map((n) => ({
      ...n,
      selected: n.id === activeFocusId,
      style: {
        opacity: !activeFocusId || n.id === activeFocusId || connectedNodeIds.has(n.id) ? 1 : 0.35,
        transition: 'opacity 0.2s',
      },
    })),
    [baseNodes, activeFocusId, connectedNodeIds]
  );

  const edges = useMemo(() =>
    extraEdges.map((e) => ({
      ...e,
      selected: connectedEdgeIds.has(e.id),
      style: {
        opacity: !activeFocusId || connectedEdgeIds.has(e.id) ? 1 : 0.15,
        transition: 'opacity 0.2s',
      },
    })),
    [extraEdges, activeFocusId, connectedEdgeIds]
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setBaseNodes((nds) => applyNodeChanges(changes, nds) as typeof nds);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setExtraEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'miniNode') return;
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const proximityThrottle = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - proximityThrottle.current < 50) return;
      proximityThrottle.current = now;

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const threshold = 180 / getZoom();

      let nearestId: string | null = null;
      let nearestDist = threshold;

      for (const n of baseNodes) {
        if (n.type !== 'graphNode') continue;
        const cx = n.position.x + 100;
        const cy = n.position.y + 75;
        const dx = flowPos.x - cx;
        const dy = flowPos.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = n.id;
        }
      }

      setProximityFocusId(nearestId);
    },
    [baseNodes, screenToFlowPosition, getZoom]
  );

  const handleMouseLeave = useCallback(() => setProximityFocusId(null), []);

  const onPaneClick = useCallback(() => onSelectNode(null), [onSelectNode]);

  return (
    <div
      style={{ position: 'relative', flex: 1, height: '100%' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <CanvasToolbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        edgesReconnectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <ZoomControls />
        <MiniMap
          style={{
            background: '#0c0e18',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
          }}
          nodeColor={(n) => {
            const data = n.data as NodeData;
            const colorMap: Record<string, string> = {
              purple: '#7c3aed',
              teal: '#0d9488',
              blue: '#2563eb',
              orange: '#d97706',
              slate: '#334155',
            };
            return colorMap[data?.color] ?? '#334155';
          }}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>
    </div>
  );
}
