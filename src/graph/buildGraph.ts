import type { MetadataNode, MetadataEdge } from '../types';

// ── Per-category visual sizing ────────────────────────────────────────────────
const CATEGORY_RADIUS: Record<string, number> = {
  'Business Domain':   38,
  'Database':          34,
  'Source System':     13,
  'Schema':            10,
  'Table':             13,
  'Column':             7,
  'ETL Job':           11,
  'Report':            12,
  'Team':              10,
  'Data Quality Rule':  9,
};
const DEFAULT_RADIUS = 10;

// ── Per-category physics mass (higher = less movement) ────────────────────────
const CATEGORY_MASS: Record<string, number> = {
  'Business Domain':   4.0,
  'Database':          3.5,
  'Source System':     1.2,
  'Schema':            1.0,
  'Table':             1.2,
  'Column':            0.7,
  'ETL Job':           1.0,
  'Report':            1.0,
  'Team':              0.9,
  'Data Quality Rule': 0.9,
};
const DEFAULT_MASS = 1.0;

// ── Layout geometry ───────────────────────────────────────────────────────────
const GOLDEN_ANGLE   = 2.39996322972865332; // radians ≈ 137.5°
const NUCLEUS_RING_R = 700;  // world units from origin to nucleus center
const SAT_RING_1_R   = 155;  // first satellite ring
const SAT_RING_2_R   = 268;  // overflow ring
const SAT_RING_3_R   = 378;  // second overflow ring
const COL_RING_R     = 50;   // column orbit radius around parent table

// ── Public types ──────────────────────────────────────────────────────────────

export interface GraphNode {
  id:        string;
  meta:      MetadataNode;
  nucleusId: string;
  parentId?: string;     // set for Column nodes — their parent table's id
  hx:        number;
  hy:        number;
  radius:    number;
  mass:      number;
  isNucleus: boolean;
}

export interface GraphEdge {
  id:           string;
  source:       string;
  target:       string;
  relationship: string;
}

export interface GraphData {
  nodes:      GraphNode[];
  edges:      GraphEdge[];
  nucleusIds: Set<string>;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Converts raw MetadataNode/MetadataEdge arrays into render-ready GraphData.
 * All cluster logic is derived from the data — no hardcoded node ids.
 */
export function buildGraph(
  metadataNodes: MetadataNode[],
  metadataEdges: MetadataEdge[],
): GraphData {
  const byId = new Map(metadataNodes.map((n) => [n.id, n]));

  // ── 1. Identify nuclei ────────────────────────────────────────────────────
  // Business Domain nodes + the single Database node (platform nucleus)
  const nuclei = metadataNodes.filter(
    (n) => n.category === 'Business Domain' || n.category === 'Database',
  );
  const nucleiIds = new Set(nuclei.map((n) => n.id));

  const platformNucleus =
    metadataNodes.find((n) => n.category === 'Database') ?? nuclei[0];

  // Business Domain label → nucleus id  (used by domain-property assignment)
  const domainLabelToId = new Map<string, string>();
  for (const n of nuclei) {
    if (n.category === 'Business Domain') domainLabelToId.set(n.label, n.id);
  }

  // ── 2. Cluster assignment ─────────────────────────────────────────────────
  const clusterMap = new Map<string, string>(); // nodeId → nucleusId

  // Pass 1 — direct rules (skip Column nodes; handled in pass 2)
  for (const n of metadataNodes) {
    if (n.category === 'Column') continue;

    if (nucleiIds.has(n.id)) {
      // Nuclei belong to themselves
      clusterMap.set(n.id, n.id);
    } else if (n.category === 'Schema' || n.category === 'Team') {
      // Schema + Team → platform nucleus
      clusterMap.set(n.id, platformNucleus.id);
    } else if (n.domain) {
      // domain property → matching Business Domain nucleus
      const nid = domainLabelToId.get(n.domain);
      if (nid) clusterMap.set(n.id, nid);
    }
    // Others fall through to pass 3 (BFS)
  }

  // Pass 2 — Column nodes inherit their parent table's cluster
  const columnParentMap = new Map<string, string>(); // colId → tableId
  for (const e of metadataEdges) {
    if (e.relationship !== 'belongs to') continue;
    const src = byId.get(e.source);
    const tgt = byId.get(e.target);
    if (src?.category === 'Column' && tgt?.category === 'Table') {
      columnParentMap.set(e.source, e.target);
      clusterMap.set(e.source, clusterMap.get(e.target) ?? platformNucleus.id);
    }
  }

  // Pass 3 — unassigned non-Column nodes: BFS to nearest nucleus
  const adj = new Map<string, string[]>();
  for (const e of metadataEdges) {
    const push = (k: string, v: string) => {
      const a = adj.get(k) ?? [];
      a.push(v);
      adj.set(k, a);
    };
    push(e.source, e.target);
    push(e.target, e.source);
  }

  for (const n of metadataNodes) {
    if (clusterMap.has(n.id) || n.category === 'Column') continue;
    const visited = new Set<string>();
    const queue: string[] = [n.id];
    let found: string | null = null;
    outer: while (queue.length > 0) {
      const curr = queue.shift()!;
      if (visited.has(curr)) continue;
      visited.add(curr);
      if (nucleiIds.has(curr)) { found = curr; break outer; }
      for (const nb of adj.get(curr) ?? []) {
        if (!visited.has(nb)) queue.push(nb);
      }
    }
    clusterMap.set(n.id, found ?? platformNucleus.id);
  }

  // Final safety net
  for (const n of metadataNodes) {
    if (!clusterMap.has(n.id)) clusterMap.set(n.id, platformNucleus.id);
  }

  // ── 3. Home positions ──────────────────────────────────────────────────────
  const homePos = new Map<string, { hx: number; hy: number }>();

  // Nuclei — evenly spaced around a ring, starting at top (−π/2)
  nuclei.forEach((nucleus, i) => {
    const angle = (i / nuclei.length) * 2 * Math.PI - Math.PI / 2;
    homePos.set(nucleus.id, {
      hx: Math.cos(angle) * NUCLEUS_RING_R,
      hy: Math.sin(angle) * NUCLEUS_RING_R,
    });
  });

  // Satellites — golden-angle spiral around their nucleus home position
  const satsByNucleus = new Map<string, MetadataNode[]>();
  for (const n of metadataNodes) {
    if (nucleiIds.has(n.id) || n.category === 'Column') continue;
    const nid = clusterMap.get(n.id) ?? platformNucleus.id;
    const arr = satsByNucleus.get(nid) ?? [];
    arr.push(n);
    satsByNucleus.set(nid, arr);
  }

  for (const [nucleusId, sats] of satsByNucleus) {
    const np = homePos.get(nucleusId)!;
    sats.forEach((sat, i) => {
      const angle = i * GOLDEN_ANGLE;
      const ring =
        i < 8  ? SAT_RING_1_R :
        i < 16 ? SAT_RING_2_R :
                 SAT_RING_3_R;
      homePos.set(sat.id, {
        hx: np.hx + Math.cos(angle) * ring,
        hy: np.hy + Math.sin(angle) * ring,
      });
    });
  }

  // Columns — small ring around their parent table's home position
  const colsByTable = new Map<string, MetadataNode[]>();
  for (const [colId, tableId] of columnParentMap) {
    const col = byId.get(colId);
    if (!col) continue;
    const arr = colsByTable.get(tableId) ?? [];
    arr.push(col);
    colsByTable.set(tableId, arr);
  }

  for (const [tableId, cols] of colsByTable) {
    const tp = homePos.get(tableId);
    if (!tp) continue;
    cols.forEach((col, i) => {
      const angle = (i / cols.length) * 2 * Math.PI - Math.PI / 2;
      homePos.set(col.id, {
        hx: tp.hx + Math.cos(angle) * COL_RING_R,
        hy: tp.hy + Math.sin(angle) * COL_RING_R,
      });
    });
  }

  // Safety net — any node still unplaced
  let stray = 0;
  for (const n of metadataNodes) {
    if (!homePos.has(n.id)) {
      homePos.set(n.id, { hx: stray * 80, hy: NUCLEUS_RING_R * 2 });
      stray++;
    }
  }

  // ── 4. Assemble output ─────────────────────────────────────────────────────
  const nodes: GraphNode[] = metadataNodes.map((n) => {
    const pos = homePos.get(n.id)!;
    return {
      id:        n.id,
      meta:      n,
      nucleusId: clusterMap.get(n.id) ?? platformNucleus.id,
      parentId:  columnParentMap.get(n.id),
      hx:        pos.hx,
      hy:        pos.hy,
      radius:    CATEGORY_RADIUS[n.category] ?? DEFAULT_RADIUS,
      mass:      CATEGORY_MASS[n.category]   ?? DEFAULT_MASS,
      isNucleus: nucleiIds.has(n.id),
    };
  });

  const edges: GraphEdge[] = metadataEdges.map((e) => ({
    id:           e.id,
    source:       e.source,
    target:       e.target,
    relationship: e.relationship,
  }));

  return { nodes, edges, nucleusIds: nucleiIds };
}
