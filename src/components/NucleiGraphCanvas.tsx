import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  applyNodeChanges,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

import NucleiNode, { NUC_SIZE, SAT_SIZE } from './NucleiNode';
import type { NucleiNodeData } from './NucleiNode';
import NucleiEdge from './NucleiEdge';
import type { NucleiEdgeData } from './NucleiEdge';
import { rawNucleiNodes, rawNucleiLinks } from '../data/nucleiData';

const PENTAGON_R = 500;
const SAT_ORBIT_R = 220;
const NUC_R = NUC_SIZE / 2;
const SAT_R = SAT_SIZE / 2;

const NODE_TYPES = { nuclNode: NucleiNode };
const EDGE_TYPES = { nuclEdge: NucleiEdge };

function buildInitialGraph(): { nodes: Node<NucleiNodeData>[]; edges: Edge<NucleiEdgeData>[] } {
  const positions: Record<string, { x: number; y: number }> = {};
  const nuclei = rawNucleiNodes.filter(n => n.role === 'nucleus');

  nuclei.forEach((nuc, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i / nuclei.length);
    const cx = Math.cos(angle) * PENTAGON_R;
    const cy = Math.sin(angle) * PENTAGON_R;
    positions[nuc.id] = { x: cx - NUC_R, y: cy - NUC_R };

    const sats = rawNucleiNodes.filter(s => s.role === 'satellite' && s.clusterId === nuc.id);
    sats.forEach((sat, j) => {
      const satAngle = angle + (2 * Math.PI * j / sats.length);
      const sx = cx + Math.cos(satAngle) * SAT_ORBIT_R;
      const sy = cy + Math.sin(satAngle) * SAT_ORBIT_R;
      positions[sat.id] = { x: sx - SAT_R, y: sy - SAT_R };
    });
  });

  const nodes: Node<NucleiNodeData>[] = rawNucleiNodes.map(n => {
    const fallback = { x: 0, y: 0 };
    return {
      id: n.id,
      type: 'nuclNode',
      position: positions[n.id] ?? fallback,
      data: {
        label: n.label,
        role: n.role,
        clusterId: n.clusterId,
        color: n.color,
        val: n.val,
        systemCode: n.systemCode,
        originalGroup: n.originalGroup,
        systemType: n.systemType,
        dataZone: n.dataZone,
        feeds: n.feeds,
      },
      width: n.role === 'nucleus' ? NUC_SIZE : SAT_SIZE,
      height: n.role === 'nucleus' ? NUC_SIZE : SAT_SIZE,
    };
  });

  // inter edges first (rendered behind intra)
  const interLinks = rawNucleiLinks.filter(l => l.type === 'inter');
  const intraLinks = rawNucleiLinks.filter(l => l.type === 'intra');

  const edges: Edge<NucleiEdgeData>[] = [...interLinks, ...intraLinks].map((link, i) => ({
    id: `e${i}-${link.source}-${link.target}`,
    source: link.source,
    target: link.target,
    type: 'nuclEdge',
    data: {
      edgeType: link.type,
      relationship: link.relationship,
      sourceRadius: link.type === 'inter' ? NUC_R : SAT_R,
      targetRadius: NUC_R,
    },
  }));

  return { nodes, edges };
}

const { nodes: INITIAL_NODES, edges: INITIAL_EDGES } = buildInitialGraph();

function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const btnStyle: React.CSSProperties = {
    width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, background: 'transparent', border: 'none',
    cursor: 'pointer', color: '#64748b',
    transition: 'color 0.15s, background 0.15s',
  };
  return (
    <div
      style={{
        position: 'absolute', bottom: 24, left: 16, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 2, padding: 6,
        background: 'rgba(10,10,18,0.92)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <button style={btnStyle} onClick={() => zoomIn({ duration: 200 })}>
        <ZoomIn size={13} />
      </button>
      <div style={{ width: 18, height: 1, background: 'rgba(255,255,255,0.06)', margin: '1px auto' }} />
      <button style={btnStyle} onClick={() => zoomOut({ duration: 200 })}>
        <ZoomOut size={13} />
      </button>
      <button style={btnStyle} onClick={() => fitView({ padding: 0.12, duration: 700 })}>
        <Maximize2 size={12} />
      </button>
    </div>
  );
}

function NucleiInner() {
  const { fitView } = useReactFlow();
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node<NucleiNodeData>[]>(INITIAL_NODES);

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.12, duration: 900 }), 120);
    return () => clearTimeout(t);
  }, [fitView]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds) as Node<NucleiNodeData>[]);
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const data = node.data as NucleiNodeData;
      if (data.role !== 'nucleus') return;

      if (activeCluster === node.id) {
        setActiveCluster(null);
        fitView({ padding: 0.12, duration: 650 });
      } else {
        setActiveCluster(node.id);
        const clusterNodeIds = nodes
          .filter(n => (n.data as NucleiNodeData).clusterId === node.id)
          .map(n => ({ id: n.id }));
        fitView({ nodes: clusterNodeIds, padding: 0.28, duration: 700 });
      }
    },
    [activeCluster, nodes, fitView]
  );

  const onPaneClick = useCallback(() => {
    if (activeCluster) {
      setActiveCluster(null);
      fitView({ padding: 0.12, duration: 500 });
    }
  }, [activeCluster, fitView]);

  const displayNodes = useMemo(() =>
    nodes.map(n => {
      const data = n.data as NucleiNodeData;
      const inCluster = data.clusterId === activeCluster;
      return {
        ...n,
        selected: activeCluster ? n.id === activeCluster : false,
        style: {
          opacity: !activeCluster || inCluster ? 1 : 0.08,
          transition: 'opacity 0.3s',
        },
      };
    }),
    [nodes, activeCluster]
  );

  const displayEdges = useMemo(() =>
    INITIAL_EDGES.map(e => {
      const edgeData = e.data as NucleiEdgeData;
      const isActive = !activeCluster ||
        (edgeData.edgeType === 'intra' &&
          (e.source === activeCluster || e.target === activeCluster));
      return {
        ...e,
        style: {
          opacity: isActive ? 1 : 0.04,
          transition: 'opacity 0.3s',
        },
      };
    }),
    [activeCluster]
  );

  return (
    <ReactFlow
      nodes={displayNodes}
      edges={displayEdges}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      nodesDraggable={false}
      nodesConnectable={false}
      edgesFocusable={false}
      edgesReconnectable={false}
      fitView
      fitViewOptions={{ padding: 0.12 }}
      minZoom={0.08}
      maxZoom={2.5}
      proOptions={{ hideAttribution: true }}
      style={{ background: 'transparent' }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={28}
        size={1}
        color="rgba(255,255,255,0.025)"
      />
      <ZoomControls />
      <MiniMap
        style={{
          background: '#060610',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10,
        }}
        nodeColor={(n) => {
          const data = n.data as NucleiNodeData;
          return data?.color ?? '#334155';
        }}
        maskColor="rgba(0,0,0,0.55)"
      />
    </ReactFlow>
  );
}

export default function NucleiGraphCanvas() {
  return (
    <div style={{ position: 'relative', flex: 1, height: '100%', background: '#0a0a12' }}>
      <NucleiInner />
    </div>
  );
}
