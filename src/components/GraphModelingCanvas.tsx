import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { mockNodes, mockEdges, miniNodes, miniBasePositions, miniAnimParams } from '../mockGraphData';
import type { NodeData, MiniNodeData } from '../mockGraphData';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// Per-selected-node explicit layouts: dx/dy offsets from the selected node's
// top-left position to each connected node's top-left position.
// Keeps mini-node orbits from colliding and routes edges into readable arcs.
const FOCUS_LAYOUTS: Record<string, Record<string, { dx: number; dy: number }>> = {
  order: {
    person:  { dx: -400, dy: -420 },  // upper-left
    deep:    { dx: -560, dy:   20 },  // left
    product: { dx:  500, dy: -380 },  // upper-right
    invoice: { dx:  500, dy:  360 },  // lower-right
  },
};

const nodeTypes = { graphNode: GraphNode, miniNode: MiniGraphNode };
const edgeTypes = { graphEdge: GraphEdge };

type Props = {
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
};

function ZoomControls() {
  const { zoomTo, getZoom, fitView } = useReactFlow();

  const handleZoomIn = () => {
    zoomTo(Math.min(getZoom() * 1.45, 3), { duration: 200 });
  };

  const handleZoomOut = () => {
    zoomTo(Math.max(getZoom() * 0.7, 0.25), { duration: 200 });
  };

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
        onClick={handleZoomIn}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors"
      >
        <ZoomIn size={13} className="text-slate-400" />
      </button>

      <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 auto' }} />

      <button
        onClick={handleZoomOut}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors"
      >
        <ZoomOut size={13} className="text-slate-400" />
      </button>

      <button
        onClick={() => fitView({ padding: 0.08, duration: 600 })}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors"
      >
        <Maximize2 size={12} className="text-slate-400" />
      </button>
    </div>
  );
}

export default function GraphModelingCanvas({ selectedNodeId, onSelectNode }: Props) {
  const { screenToFlowPosition, getZoom, fitView, setCenter } = useReactFlow();

  const NUCLEUS_CENTER = 70;
  const FOCUS_RING_RADIUS = 430;  // Distance from selected node center to connected node centers. Less distance, closer together, more overlap
  const SELECTED_ZOOM = .6;       // Zoom level when a node is selected. Less zoom, more nodes visible, more overlap

  const [proximityFocusId, setProximityFocusId] = useState<string | null>(null);
  const [baseNodes, setBaseNodes] = useState(() => [...mockNodes, ...miniNodes]);
  const [extraEdges, setExtraEdges] = useState(mockEdges);

  const activeFocusId = selectedNodeId ?? proximityFocusId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const s = new Set<string>();
    extraEdges.forEach((e) => {
      if ((e.data as { isParent?: boolean })?.isParent) return;
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
    baseNodes.map((n) => {
      let opacity = 1;
      if (activeFocusId) {
        if (n.type === 'miniNode') {
          const pId = (n.data as MiniNodeData).parentId;
          opacity = pId === activeFocusId || connectedNodeIds.has(pId) ? 1 : 0.2;
        } else {
          opacity = n.id === activeFocusId || connectedNodeIds.has(n.id) ? 1 : 0.35;
        }
      }
      return {
        ...n,
        selected: n.id === activeFocusId,
        style: { opacity, transition: 'opacity 0.3s' },
      };
    }),
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

  // ── Physics state (refs, never cause re-renders) ──────────────────────────
  // Keyed by graphNode id. Positions are the node top-left corner in flow space.
  const parentPosRef = useRef<Record<string, { x: number; y: number }>>({});
  const parentVelRef = useRef<Record<string, { vx: number; vy: number }>>({});
  const parentAnchorRef = useRef<Record<string, { x: number; y: number }>>({});
  const cursorFlowPosRef = useRef<{ x: number; y: number } | null>(null);
  // Tracks click-selection so the animation loop (closed over []) can read it.
  const selectionRef = useRef<{ id: string | null; connected: Set<string> }>({ id: null, connected: new Set() });

  // Seed physics state from the static node positions (runs once on mount).
  useEffect(() => {
    mockNodes.forEach(n => {
      parentPosRef.current[n.id] = { x: n.position.x, y: n.position.y };
      parentVelRef.current[n.id] = { vx: 0, vy: 0 };
      parentAnchorRef.current[n.id] = { x: n.position.x, y: n.position.y };
    });
  }, []);

  // Sync selectionRef so the stable animation loop can read current selection.
  useEffect(() => {
    selectionRef.current.id = selectedNodeId;
    if (selectedNodeId) {
      const s = new Set<string>();
      mockEdges.forEach(e => {
        if ((e.data as { isParent?: boolean })?.isParent) return;
        if (e.source === selectedNodeId) s.add(e.target);
        if (e.target === selectedNodeId) s.add(e.source);
      });
      selectionRef.current.connected = s;
    } else {
      selectionRef.current.connected = new Set();
    }
  }, [selectedNodeId]);

  // Animate viewport: center on selected node with fixed zoom; fitView on deselect.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedNodeId) {
        const pos = parentPosRef.current[selectedNodeId];
        const selNode = mockNodes.find(n => n.id === selectedNodeId);
        const base = selNode ? selNode.position : { x: 0, y: 0 };
        const cx = (pos?.x ?? base.x) + NUCLEUS_CENTER;
        const cy = (pos?.y ?? base.y) + NUCLEUS_CENTER;
        setCenter(cx, cy, { zoom: SELECTED_ZOOM, duration: 550 });
      } else {
        fitView({ padding: 0.2, duration: 500 });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [selectedNodeId, fitView, setCenter]);

  // Place connected-node anchors: explicit layout for known nodes, ring fallback.
  useEffect(() => {
    mockNodes.forEach(n => {
      parentAnchorRef.current[n.id] = { x: n.position.x, y: n.position.y };
    });
    if (!selectedNodeId) return;
    const selNode = mockNodes.find(n => n.id === selectedNodeId);
    if (!selNode) return;
    const selectedCx = selNode.position.x + NUCLEUS_CENTER;
    const selectedCy = selNode.position.y + NUCLEUS_CENTER;
    const connectedIds = Array.from(selectionRef.current.connected);
    const layout = FOCUS_LAYOUTS[selectedNodeId];
    connectedIds.forEach((id, index) => {
      if (layout?.[id]) {
        parentAnchorRef.current[id] = {
          x: selNode.position.x + layout[id].dx,
          y: selNode.position.y + layout[id].dy,
        };
      } else {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI) / connectedIds.length;
        const targetCx = selectedCx + Math.cos(angle) * FOCUS_RING_RADIUS;
        const targetCy = selectedCy + Math.sin(angle) * FOCUS_RING_RADIUS;
        parentAnchorRef.current[id] = {
          x: targetCx - NUCLEUS_CENTER,
          y: targetCy - NUCLEUS_CENTER,
        };
      }
    });
  }, [selectedNodeId]);

  // ── Combined rAF loop: parent physics + mini-node drift, ~30 fps ──────────
  const frameIdRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    const FRAME_BUDGET = 1000 / 30;

    // Nucleus radius for center-of-mass calculations (matches GraphNode NUCLEUS_SIZE/2).
    const NR = 70;
    // Physics constants — tuned for soft-gravity feel, not rigid physics.
    const ANCHOR_K = 0.09;          // How hard nodes pull toward target anchor
    const CURSOR_FORCE = 3.2;       // How hard nodes are attracted to the cursor when nearby
    const CURSOR_RADIUS = 420;      // Ignore cursor attraction if farther than this
    const MIN_CURSOR_DIST = 90;     // Ignore cursor attraction if closer than this (prevents jitter)
    const REPEL_K = 0.5;            // How hard nodes repel each other when too close
    const REPEL_DIST = 210;         // Ignore repulsion if farther than this (prevents jitter)
    const DAMPING = 0.75;           // How much velocity is retained each frame (0.5 = very soft, 0.9 = very stiff)
    const MAX_SPEED = 30;           // Clamp velocity to prevent runaway nodes

    const loop = (timestamp: number) => {
      frameIdRef.current = requestAnimationFrame(loop);

      if (timestamp - lastTickRef.current < FRAME_BUDGET) return;
      lastTickRef.current = timestamp;

      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const t = (timestamp - startTimeRef.current) / 1000;

      // ── Parent nucleus physics ──────────────────────────────────────────
      const parentIds = Object.keys(parentPosRef.current);
      const cursor = cursorFlowPosRef.current;

      for (const id of parentIds) {
        const pos = parentPosRef.current[id];
        const vel = parentVelRef.current[id];
        const anchor = parentAnchorRef.current[id];

        // Nucleus center (for force calculations).
        const cx = pos.x + NR;
        const cy = pos.y + NR;

        let fx = 0, fy = 0;

        // 1. Anchor spring — gently pulls nucleus back toward its home position.
        fx += -(pos.x - anchor.x) * ANCHOR_K;
        fy += -(pos.y - anchor.y) * ANCHOR_K;

        // 2. Cursor attraction — disabled while a node is selected.
        if (cursor && !selectionRef.current.id) {
          const dx = cursor.x - cx;
          const dy = cursor.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > MIN_CURSOR_DIST && dist < CURSOR_RADIUS) {
            const t2 = 1 - dist / CURSOR_RADIUS;
            const str = (t2 * t2 * CURSOR_FORCE) / dist;
            fx += dx * str;
            fy += dy * str;
          }
        }

        // 3. Pairwise repulsion — keeps nuclei from overlapping.
        for (const otherId of parentIds) {
          if (otherId === id) continue;
          const other = parentPosRef.current[otherId];
          const ocx = other.x + NR;
          const ocy = other.y + NR;
          const dx = cx - ocx;
          const dy = cy - ocy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.1 && dist < REPEL_DIST) {
            const str = ((REPEL_DIST - dist) * REPEL_K) / dist;
            fx += dx * str;
            fy += dy * str;
          }
        }

        // Integrate velocity with damping, clamp speed.
        vel.vx = (vel.vx + fx) * DAMPING;
        vel.vy = (vel.vy + fy) * DAMPING;
        const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
        if (speed > MAX_SPEED) {
          vel.vx *= MAX_SPEED / speed;
          vel.vy *= MAX_SPEED / speed;
        }

        pos.x += vel.vx;
        pos.y += vel.vy;
      }

      // ── Flush both parent positions and mini drift into React state ───────
      setBaseNodes(prev =>
        prev.map(node => {
          if (node.type === 'graphNode') {
            const pos = parentPosRef.current[node.id];
            return pos ? { ...node, position: { x: pos.x, y: pos.y } } : node;
          }

          if (node.type === 'miniNode') {
            const base = miniBasePositions[node.id];
            const p = miniAnimParams[node.id];
            if (!base || !p) return node;
            const x =
              base.x +
              Math.sin(t * p.speed + p.phase) * p.amplitudeX +
              Math.sin(t * p.speed * 0.37 + p.phase + 1.3) * (p.amplitudeX * 0.42);
            const y =
              base.y +
              Math.cos(t * p.speed * 0.8 + p.phase) * p.amplitudeY +
              Math.sin(t * p.speed * 0.53 + p.phase + 0.7) * (p.amplitudeY * 0.5);
            return { ...node, position: { x, y } };
          }

          return node;
        })
      );
    };

    frameIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, []); // empty — setBaseNodes and all physics refs are stable

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const proximityThrottle = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - proximityThrottle.current < 50) return;
      proximityThrottle.current = now;

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      cursorFlowPosRef.current = flowPos;

      // Proximity focus: find closest nucleus center within threshold.
      const threshold = 200 / getZoom();
      let nearestId: string | null = null;
      let nearestDist = threshold;

      for (const [nodeId, pos] of Object.entries(parentPosRef.current)) {
        const cx = pos.x + NUCLEUS_CENTER;
        const cy = pos.y + NUCLEUS_CENTER;
        const dx = flowPos.x - cx;
        const dy = flowPos.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = nodeId;
        }
      }

      setProximityFocusId(nearestId);
    },
    [screenToFlowPosition, getZoom]
  );

  const handleMouseLeave = useCallback(() => {
    setProximityFocusId(null);
    cursorFlowPosRef.current = null;
  }, []);

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
        minZoom={0.25}
        maxZoom={3}
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
