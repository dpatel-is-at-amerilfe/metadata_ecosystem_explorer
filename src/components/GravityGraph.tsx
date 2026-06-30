import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { buildGraph } from '../graph/buildGraph';
import { metadataNodes, metadataEdges } from '../data/metadata';
import {
  CATEGORY_STYLES,
  RELATIONSHIP_STYLES,
  CATEGORY_ORDER,
  RELATIONSHIP_ORDER,
} from '../lib/theme';

// ═══════════════════════════════════════════════════════════════════════════════
// Physics constants — tune here
// ═══════════════════════════════════════════════════════════════════════════════
const CURSOR_R    = 300;    // world-unit gravity field radius
const PULL_STR    = 0.04;   // cursor attraction coefficient
const SPRING_K    = 0.022;  // home-spring stiffness per frame
const DAMPING     = 0.87;   // velocity multiplier per frame
const FOCUS_LERP  = 0.14;   // per-frame smoothing speed for focus / brightness
const DRIFT_AMP   = 0.003;  // ambient sinusoidal drift velocity amplitude
const DRIFT_FREQ  = 0.00042; // ambient drift frequency (radians / ms)
const CLICK_SLOP  = 5;      // px movement threshold: click vs drag

// ═══════════════════════════════════════════════════════════════════════════════
// Internal types
// ═══════════════════════════════════════════════════════════════════════════════

interface PhysNode {
  id: string;
  x: number;  y: number;
  vx: number; vy: number;
  hx: number; hy: number;
  focus:      number;
  brightness: number;
  driftPhase: number;
  radius:     number;
  mass:       number;
  isNucleus:  boolean;
  category:   string;
  label:      string;
}

interface Camera { x: number; y: number; zoom: number; }

interface TooltipState { id: string; sx: number; sy: number; }

// ═══════════════════════════════════════════════════════════════════════════════
// Pure helpers
// ═══════════════════════════════════════════════════════════════════════════════

function smoothstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function w2s(
  wx: number, wy: number,
  cam: Camera, W: number, H: number,
): [number, number] {
  return [
    (wx - cam.x) * cam.zoom + W / 2,
    (wy - cam.y) * cam.zoom + H / 2,
  ];
}

function s2w(
  sx: number, sy: number,
  cam: Camera, W: number, H: number,
): [number, number] {
  return [
    (sx - W / 2) / cam.zoom + cam.x,
    (sy - H / 2) / cam.zoom + cam.y,
  ];
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function findNodeAt(
  sx: number, sy: number,
  phys: Map<string, PhysNode>,
  cam: Camera, W: number, H: number,
): string | null {
  const [wx, wy] = s2w(sx, sy, cam, W, H);
  let closestId: string | null = null;
  let closestDist = Infinity;
  for (const [id, pn] of phys) {
    const dx = pn.x - wx;
    const dy = pn.y - wy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hitR = Math.max(pn.radius * 1.5, 10 / cam.zoom);
    if (dist < hitR && dist < closestDist) {
      closestDist = dist;
      closestId = id;
    }
  }
  return closestId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Module-level stable data (computed once at import time)
// ═══════════════════════════════════════════════════════════════════════════════

const GRAPH = buildGraph(metadataNodes, metadataEdges);

// Per-node neighbor sets (undirected)
const NEIGHBOR_MAP      = new Map<string, Set<string>>();
const NEIGHBOR_EDGE_MAP = new Map<string, Set<string>>();
for (const e of GRAPH.edges) {
  if (!NEIGHBOR_MAP.has(e.source)) NEIGHBOR_MAP.set(e.source, new Set());
  if (!NEIGHBOR_MAP.has(e.target)) NEIGHBOR_MAP.set(e.target, new Set());
  NEIGHBOR_MAP.get(e.source)!.add(e.target);
  NEIGHBOR_MAP.get(e.target)!.add(e.source);

  if (!NEIGHBOR_EDGE_MAP.has(e.source)) NEIGHBOR_EDGE_MAP.set(e.source, new Set());
  if (!NEIGHBOR_EDGE_MAP.has(e.target)) NEIGHBOR_EDGE_MAP.set(e.target, new Set());
  NEIGHBOR_EDGE_MAP.get(e.source)!.add(e.id);
  NEIGHBOR_EDGE_MAP.get(e.target)!.add(e.id);
}

const GRAPH_NODE_MAP = new Map(GRAPH.nodes.map((n) => [n.id, n]));

const EDGE_COUNTS = new Map<string, number>();
for (const e of metadataEdges) {
  EDGE_COUNTS.set(e.relationship, (EDGE_COUNTS.get(e.relationship) ?? 0) + 1);
}

const NODE_COUNTS = new Map<string, number>();
for (const n of metadataNodes) {
  NODE_COUNTS.set(n.category, (NODE_COUNTS.get(n.category) ?? 0) + 1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tooltip sub-component
// ═══════════════════════════════════════════════════════════════════════════════

interface TooltipProps {
  info: TooltipState | null;
  pinnedId: string | null;
  containerW: number;
  containerH: number;
}

function NodeTooltip({ info, pinnedId, containerW, containerH }: TooltipProps) {
  if (!info) return null;
  const gn = GRAPH_NODE_MAP.get(info.id);
  if (!gn) return null;

  const meta = gn.meta;
  const cs = (CATEGORY_STYLES as Record<string, { color: string }>)[meta.category]
    ?? { color: '#94a3b8' };
  const isPinned = info.id === pinnedId;

  const rawLeft = info.sx + 20;
  const rawTop  = info.sy - 12;
  const left    = Math.min(rawLeft, containerW - 270);
  const top     = Math.max(4, Math.min(rawTop, containerH - 220));

  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{ left, top, width: 256 }}
    >
      <div
        style={{
          background: 'rgba(6,8,20,0.97)',
          border: `1px solid ${cs.color}55`,
          borderRadius: 10,
          padding: '10px 13px',
          boxShadow: `0 6px 36px rgba(0,0,0,0.75), 0 0 20px ${cs.color}1a`,
          backdropFilter: 'blur(10px)',
        }}
      >
        {isPinned && (
          <div style={{ fontSize: 9, color: cs.color, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.75 }}>
            ◉ Pinned — click to release
          </div>
        )}
        <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', marginBottom: 5, lineHeight: 1.3 }}>
          {meta.label}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 7 }}>
          <span style={{ background: `${cs.color}22`, color: cs.color, borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 600 }}>
            {meta.category}
          </span>
          {meta.type && (
            <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>
              {meta.type}
            </span>
          )}
          {meta.pii && (
            <span style={{ background: 'rgba(239,68,68,0.18)', color: '#f87171', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
              PII
            </span>
          )}
          {meta.sensitive && (
            <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
              Sensitive
            </span>
          )}
        </div>
        {meta.owner && (
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>
            Owner: <span style={{ color: '#cbd5e1' }}>{meta.owner}</span>
          </div>
        )}
        {meta.description && (
          <div style={{ fontSize: 11, color: '#475569', marginTop: 5, lineHeight: 1.45, overflow: 'hidden', maxHeight: 56 }}>
            {meta.description}
          </div>
        )}
        {(meta.criticality || meta.dataQualityScore !== undefined || meta.status) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
            {meta.criticality && (
              <span style={{ fontSize: 10, color: '#64748b' }}>
                Criticality: <span style={{ color: '#cbd5e1' }}>{meta.criticality}</span>
              </span>
            )}
            {meta.status && (
              <span style={{ fontSize: 10, color: '#64748b' }}>
                Status: <span style={{ color: meta.status === 'Active' || meta.status === 'Passing' ? '#4ade80' : '#fbbf24' }}>{meta.status}</span>
              </span>
            )}
            {meta.dataQualityScore !== undefined && (
              <span style={{ fontSize: 10, color: '#64748b' }}>
                DQ: <span style={{ color: meta.dataQualityScore >= 90 ? '#4ade80' : meta.dataQualityScore >= 75 ? '#fbbf24' : '#f87171' }}>
                  {meta.dataQualityScore}%
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Legend sub-component
// ═══════════════════════════════════════════════════════════════════════════════

function Legend() {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="absolute bottom-4 left-4 z-20 select-none"
      style={{
        background: 'rgba(6,8,20,0.93)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 4px 28px rgba(0,0,0,0.6)',
        minWidth: 170,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
        }}
      >
        <span style={{ opacity: 0.5, fontSize: 9 }}>{open ? '▾' : '▸'}</span>
        LEGEND
      </button>

      {open && (
        <div style={{ padding: '0 12px 10px', maxHeight: 340, overflowY: 'auto' }}>
          <div style={{ fontSize: 9, color: '#334155', marginBottom: 5, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Node types
          </div>
          {CATEGORY_ORDER.map((cat) => {
            const cs = CATEGORY_STYLES[cat];
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cs.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#94a3b8', flex: 1 }}>{cat}</span>
                <span style={{ fontSize: 9, color: '#334155' }}>{NODE_COUNTS.get(cat) ?? 0}</span>
              </div>
            );
          })}

          <div style={{ fontSize: 9, color: '#334155', marginTop: 9, marginBottom: 5, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Relationships
          </div>
          {RELATIONSHIP_ORDER.map((rel) => {
            const rs = RELATIONSHIP_STYLES[rel];
            return (
              <div key={rel} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <div style={{ width: 14, height: 2, background: rs.color, flexShrink: 0, borderRadius: 1, opacity: rs.dashed ? 0.6 : 1 }} />
                <span style={{ fontSize: 10, color: '#94a3b8', flex: 1 }}>{rel}</span>
                <span style={{ fontSize: 9, color: '#334155' }}>{EDGE_COUNTS.get(rel) ?? 0}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════════════════════

export default function GravityGraph() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // All mutable physics / camera state lives in refs — no re-renders per frame
  const physRef        = useRef<Map<string, PhysNode>>(new Map());
  const cameraRef      = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const cursorWorldRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef         = useRef<number>(0);
  const reducedMotion  = useRef(false);
  const dimRef         = useRef({ W: 0, H: 0 });

  // Pan tracking
  const isPanningRef    = useRef(false);
  const panStartRef     = useRef({ sx: 0, sy: 0, cx: 0, cy: 0 });
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  // Selection
  const pinnedIdRef  = useRef<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);

  // React state — only for DOM overlays, not physics
  const [tooltip, setTooltip]   = useState<TooltipState | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // ─── Fit camera to all home positions ──────────────────────────────────────
  const fitCamera = useCallback(() => {
    const { W, H } = dimRef.current;
    if (W === 0 || H === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const gn of GRAPH.nodes) {
      minX = Math.min(minX, gn.hx);
      maxX = Math.max(maxX, gn.hx);
      minY = Math.min(minY, gn.hy);
      maxY = Math.max(maxY, gn.hy);
    }
    const cx    = (minX + maxX) / 2;
    const cy    = (minY + maxY) / 2;
    const spanX = maxX - minX + 160;
    const spanY = maxY - minY + 160;
    const zoom  = Math.min(1.4, (W / spanX) * 0.85, (H / spanY) * 0.85);
    cameraRef.current = { x: cx, y: cy, zoom };
  }, []);

  // ─── Initialise physics nodes ───────────────────────────────────────────────
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phys = physRef.current;
    GRAPH.nodes.forEach((gn, i) => {
      phys.set(gn.id, {
        id:         gn.id,
        x:          gn.hx, y: gn.hy,
        vx:         0,     vy: 0,
        hx:         gn.hx, hy: gn.hy,
        focus:      0,
        brightness: gn.isNucleus ? 0.7 : 0.35,
        driftPhase: i * 2.39996,
        radius:     gn.radius,
        mass:       gn.mass,
        isNucleus:  gn.isNucleus,
        category:   gn.meta.category,
        label:      gn.meta.label,
      });
    });
  }, []);

  // ─── Main rAF render + physics loop ────────────────────────────────────────
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas || !container) return;
      const W = container.clientWidth;
      const H = container.clientHeight;
      dimRef.current = { W, H };
      canvas.width          = W * dpr;
      canvas.height         = H * dpr;
      canvas.style.width    = `${W}px`;
      canvas.style.height   = `${H}px`;
      fitCamera();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function tick() {
      if (!canvas) return;
      const { W, H } = dimRef.current;
      if (W === 0 || H === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx    = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cam    = cameraRef.current;
      const cursor = cursorWorldRef.current;
      const phys   = physRef.current;
      const t      = performance.now();
      const focusId = pinnedIdRef.current ?? hoveredIdRef.current;

      // ── Physics ────────────────────────────────────────────────────────────
      for (const pn of phys.values()) {
        // Spring toward home
        pn.vx += (pn.hx - pn.x) * SPRING_K;
        pn.vy += (pn.hy - pn.y) * SPRING_K;

        // Ambient drift — gated by prefers-reduced-motion
        if (!reducedMotion.current) {
          pn.vx += Math.sin(t * DRIFT_FREQ + pn.driftPhase) * DRIFT_AMP;
          pn.vy += Math.cos(t * DRIFT_FREQ * 1.3 + pn.driftPhase * 1.7) * DRIFT_AMP;
        }

        // Cursor gravity
        let targetFocus = 0;
        if (cursor) {
          const cdx  = cursor.x - pn.x;
          const cdy  = cursor.y - pn.y;
          const dist = Math.sqrt(cdx * cdx + cdy * cdy) + 0.001;
          const raw  = smoothstep(1 - dist / CURSOR_R);
          targetFocus = raw;
          if (raw > 0) {
            const pull = (raw * raw * PULL_STR) / pn.mass;
            pn.vx += (cdx / dist) * pull;
            pn.vy += (cdy / dist) * pull;
          }
        }

        // Integrate
        pn.vx  *= DAMPING;
        pn.vy  *= DAMPING;
        pn.x   += pn.vx;
        pn.y   += pn.vy;
        pn.focus = lerp(pn.focus, targetFocus, FOCUS_LERP);

        // Target brightness
        let targetB: number;
        if (focusId) {
          if (pn.id === focusId)                                targetB = 1.0;
          else if (NEIGHBOR_MAP.get(focusId)?.has(pn.id))      targetB = 0.72;
          else                                                  targetB = 0.09;
        } else {
          targetB = pn.isNucleus
            ? 0.68 + pn.focus * 0.32
            : 0.28 + pn.focus * 0.72;
        }
        pn.brightness = lerp(pn.brightness, targetB, FOCUS_LERP);
      }

      // ── Render ─────────────────────────────────────────────────────────────
      // Background
      ctx.fillStyle = '#05060e';
      ctx.fillRect(0, 0, W, H);

      // Cursor atmosphere + gravity well glow
      if (cursor) {
        const [csx, csy] = w2s(cursor.x, cursor.y, cam, W, H);

        // Soft atmospheric glow following cursor
        const atmoR = CURSOR_R * cam.zoom;
        const atmo  = ctx.createRadialGradient(csx, csy, 0, csx, csy, atmoR);
        atmo.addColorStop(0,   'rgba(88,68,200,0.058)');
        atmo.addColorStop(0.5, 'rgba(55,45,160,0.026)');
        atmo.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = atmo;
        ctx.fillRect(0, 0, W, H);

        // Gravity well dot
        const well = ctx.createRadialGradient(csx, csy, 0, csx, csy, 30);
        well.addColorStop(0,   'rgba(180,150,255,0.30)');
        well.addColorStop(0.5, 'rgba(140,110,230,0.10)');
        well.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = well;
        ctx.beginPath();
        ctx.arc(csx, csy, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Layer 1: membership halos (nucleus → direct satellites) ───────────
      ctx.lineWidth = 0.5;
      for (const gn of GRAPH.nodes) {
        if (!gn.isNucleus) continue;
        const np    = phys.get(gn.id)!;
        const [nsx, nsy] = w2s(np.x, np.y, cam, W, H);

        for (const sat of GRAPH.nodes) {
          if (sat.id === gn.id || sat.meta.category === 'Column' || sat.nucleusId !== gn.id) continue;
          const sp  = phys.get(sat.id)!;
          const [ssx, ssy] = w2s(sp.x, sp.y, cam, W, H);
          const alpha = 0.03 + sp.brightness * 0.06;
          ctx.beginPath();
          ctx.moveTo(nsx, nsy);
          ctx.lineTo(ssx, ssy);
          ctx.strokeStyle = `rgba(100,90,185,${alpha.toFixed(3)})`;
          ctx.stroke();
        }
      }

      // Table → column halos
      for (const gn of GRAPH.nodes) {
        if (gn.meta.category !== 'Table') continue;
        const tp = phys.get(gn.id)!;
        const [tsx, tsy] = w2s(tp.x, tp.y, cam, W, H);
        for (const col of GRAPH.nodes) {
          if (col.parentId !== gn.id) continue;
          const cp = phys.get(col.id)!;
          const [csx, csy] = w2s(cp.x, cp.y, cam, W, H);
          const alpha = 0.025 + cp.brightness * 0.045;
          ctx.beginPath();
          ctx.moveTo(tsx, tsy);
          ctx.lineTo(csx, csy);
          ctx.strokeStyle = `rgba(134,239,172,${alpha.toFixed(3)})`;
          ctx.stroke();
        }
      }

      // ── Layer 2: lineage edges ─────────────────────────────────────────────
      ctx.setLineDash([]);
      for (const edge of GRAPH.edges) {
        const sp = phys.get(edge.source);
        const tp = phys.get(edge.target);
        if (!sp || !tp) continue;

        const relStyle = (RELATIONSHIP_STYLES as Record<string, { color: string; dashed?: boolean }>)[edge.relationship];
        if (!relStyle) continue;

        const isFocused = !!(focusId && NEIGHBOR_EDGE_MAP.get(focusId)?.has(edge.id));
        const endBright = (sp.brightness + tp.brightness) / 2;
        const alpha     = isFocused
          ? Math.max(sp.brightness, tp.brightness) * 0.80
          : endBright * 0.14;

        const [ssx, ssy] = w2s(sp.x, sp.y, cam, W, H);
        const [esx, esy] = w2s(tp.x, tp.y, cam, W, H);

        // Slight quadratic curve — control point perpendicularly offset
        const mx  = (ssx + esx) / 2 - (esy - ssy) * 0.13;
        const my  = (ssy + esy) / 2 + (esx - ssx) * 0.13;

        ctx.beginPath();
        ctx.moveTo(ssx, ssy);
        ctx.quadraticCurveTo(mx, my, esx, esy);
        ctx.strokeStyle = hexToRgba(relStyle.color, alpha);
        ctx.lineWidth   = isFocused ? 1.6 : 0.7;
        if (relStyle.dashed) ctx.setLineDash([4, 7]);
        else                 ctx.setLineDash([]);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // ── Layer 3: nodes ─────────────────────────────────────────────────────
      for (const pn of phys.values()) {
        const cs = (CATEGORY_STYLES as Record<string, { color: string; glow: string }>)[pn.category]
          ?? { color: '#94a3b8', glow: 'rgba(148,163,184,0.45)' };
        const [sx, sy] = w2s(pn.x, pn.y, cam, W, H);
        const isActive = pn.id === focusId;
        const r        = pn.radius * cam.zoom * (1 + pn.focus * 0.35 + (isActive ? 0.12 : 0));
        const bright   = pn.brightness;

        if (pn.isNucleus) {
          // Outer atmosphere glow
          const glowR = r * 3.8;
          const glowG = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, glowR);
          glowG.addColorStop(0, hexToRgba(cs.color, bright * 0.30));
          glowG.addColorStop(1, hexToRgba(cs.color, 0));
          ctx.fillStyle = glowG;
          ctx.beginPath();
          ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Outer ring
          ctx.beginPath();
          ctx.arc(sx, sy, r * 1.52, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(cs.color, bright * 0.28);
          ctx.lineWidth   = 1.3;
          ctx.stroke();

          // Inner ring
          ctx.beginPath();
          ctx.arc(sx, sy, r * 1.20, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(cs.color, bright * 0.20);
          ctx.lineWidth   = 0.7;
          ctx.stroke();

          // Core fill
          const coreG = ctx.createRadialGradient(sx - r * 0.28, sy - r * 0.28, 0, sx, sy, r);
          coreG.addColorStop(0, hexToRgba(cs.color, Math.min(1, bright * 1.0)));
          coreG.addColorStop(1, hexToRgba(cs.color, bright * 0.55));
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = coreG;
          ctx.fill();

          // Always-visible label
          const fs = Math.max(10, Math.round(12 * Math.sqrt(cam.zoom)));
          ctx.font          = `600 ${fs}px system-ui, ui-sans-serif, sans-serif`;
          ctx.textAlign     = 'center';
          ctx.textBaseline  = 'top';
          ctx.fillStyle     = hexToRgba('#ddd8ff', 0.5 + bright * 0.5);
          ctx.fillText(pn.label, sx, sy + r + 5);
        } else {
          // Satellite: glow halo + core dot
          const glowR = r * 3.4;
          const glowG = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
          glowG.addColorStop(0, hexToRgba(cs.color, bright * 0.55));
          glowG.addColorStop(1, hexToRgba(cs.color, 0));
          ctx.fillStyle = glowG;
          ctx.beginPath();
          ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(cs.color, 0.1 + bright * 0.9);
          ctx.fill();

          // Label: when cursor nearby or node is selected/hovered
          const showLabel = pn.focus > 0.28 || isActive || pn.id === hoveredIdRef.current;
          if (showLabel) {
            const labelAlpha = isActive
              ? bright
              : Math.min(1, (pn.focus - 0.18) * 3.5 + 0.45) * bright;
            const fs = Math.max(8, Math.round(10 * Math.sqrt(cam.zoom)));
            ctx.font         = `${fs}px system-ui, ui-sans-serif, sans-serif`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle    = hexToRgba('#c8d4e8', Math.max(0, labelAlpha));
            ctx.fillText(pn.label, sx, sy + r + 3);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [fitCamera]);

  // ─── Non-passive wheel listener (prevents page scroll) ─────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect   = canvas.getBoundingClientRect();
      const sx     = e.clientX - rect.left;
      const sy     = e.clientY - rect.top;
      const { W, H } = dimRef.current;
      const cam    = cameraRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = Math.max(0.06, Math.min(6, cam.zoom * factor));
      cameraRef.current = {
        zoom: newZoom,
        x: cam.x + (sx - W / 2) * (1 / cam.zoom - 1 / newZoom),
        y: cam.y + (sy - H / 2) * (1 / cam.zoom - 1 / newZoom),
      };
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // ─── Global mouseup (pan ends even if cursor left canvas) ──────────────────
  useEffect(() => {
    const up = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
      }
    };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  // ─── Escape to unpin ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        pinnedIdRef.current = null;
        setPinnedId(null);
        setTooltip(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ─── Canvas coords helper ──────────────────────────────────────────────────
  const getCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  }, []);

  // ─── Mouse move: physics cursor + hover detection ─────────────────────────
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy } = getCoords(e);
    const { W, H }   = dimRef.current;
    const cam        = cameraRef.current;

    if (isPanningRef.current) {
      const ps = panStartRef.current;
      cameraRef.current = {
        ...cam,
        x: ps.cx - (sx - ps.sx) / cam.zoom,
        y: ps.cy - (sy - ps.sy) / cam.zoom,
      };
      return;
    }

    const [wx, wy]     = s2w(sx, sy, cam, W, H);
    cursorWorldRef.current = { x: wx, y: wy };

    const hitId = findNodeAt(sx, sy, physRef.current, cam, W, H);
    hoveredIdRef.current = hitId;

    if (hitId !== null) {
      setTooltip({ id: hitId, sx, sy });
    } else if (!pinnedIdRef.current) {
      setTooltip(null);
    }
  }, [getCoords]);

  const onMouseLeave = useCallback(() => {
    cursorWorldRef.current  = null;
    hoveredIdRef.current    = null;
    if (!pinnedIdRef.current) setTooltip(null);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy } = getCoords(e);
    mouseDownPosRef.current = { x: sx, y: sy };
    isPanningRef.current    = true;
    cursorWorldRef.current  = null; // no gravity pull while panning
    const cam               = cameraRef.current;
    panStartRef.current     = { sx, sy, cx: cam.x, cy: cam.y };
    canvasRef.current!.style.cursor = 'grabbing';
  }, [getCoords]);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy } = getCoords(e);
    const dx = sx - mouseDownPosRef.current.x;
    const dy = sy - mouseDownPosRef.current.y;
    isPanningRef.current            = false;
    canvasRef.current!.style.cursor = 'crosshair';

    if (Math.sqrt(dx * dx + dy * dy) < CLICK_SLOP) {
      const { W, H } = dimRef.current;
      const cam      = cameraRef.current;
      const hitId    = findNodeAt(sx, sy, physRef.current, cam, W, H);

      if (hitId && hitId === pinnedIdRef.current) {
        // Click pinned node → unpin
        pinnedIdRef.current = null;
        setPinnedId(null);
        hoveredIdRef.current = null;
        setTooltip(null);
      } else if (hitId) {
        // Pin new node
        pinnedIdRef.current = hitId;
        setPinnedId(hitId);
        setTooltip({ id: hitId, sx, sy });
      } else {
        // Click empty space → unpin
        pinnedIdRef.current = null;
        setPinnedId(null);
        setTooltip(null);
      }
    }
  }, [getCoords]);

  // Container dimensions for tooltip clamping
  const { W: contW, H: contH } = dimRef.current;

  const tooltipInfo = useMemo<TooltipState | null>(() => tooltip, [tooltip]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#05060e' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: 'crosshair' }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />

      <NodeTooltip
        info={tooltipInfo}
        pinnedId={pinnedId}
        containerW={contW || 1200}
        containerH={contH || 800}
      />

      <Legend />

      {/* Fit button */}
      <button
        onClick={fitCamera}
        className="absolute z-20"
        style={{
          bottom: 16, right: 16,
          background: 'rgba(6,8,20,0.93)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 7, padding: '5px 10px',
          color: '#64748b', fontSize: 11, cursor: 'pointer',
        }}
        title="Fit to content"
      >
        ⊞ Fit
      </button>

      {/* Interaction hint */}
      <div
        className="absolute z-20"
        style={{
          bottom: 20, left: '50%', transform: 'translateX(-50%)',
          fontSize: 10.5, color: '#2a3448', userSelect: 'none',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}
      >
        Move to attract · Click to pin · Drag to pan · Scroll to zoom · Esc to clear
      </div>
    </div>
  );
}
