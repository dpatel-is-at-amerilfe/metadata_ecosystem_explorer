import type { MetadataEdge, MetadataNode } from '../types';

export interface XY {
  x: number;
  y: number;
}

// Card-appropriate spacing:
//   COL_WIDTH  — horizontal gap between column centers.
//                Cards are ~220px wide so 450px gives ~230px breathing room.
//   ROW_HEIGHT — vertical gap between card centers.
//                Cards are ~68–90px tall so 185px gives ~100px breathing room.
const COL_WIDTH = 450;
const ROW_HEIGHT = 185;

/**
 * Layered left-to-right layout following the lineage spine:
 *   Sources → Staging → ETL Jobs → Consolidated → Reports
 *
 * Business Domains arc above, Teams below, DQ Rules beside their tables,
 * Columns fanned around their parent table, DB/Schema in the lower-left corner.
 *
 * The lineage direction is immediately readable, and generous spacing makes
 * the graph feel like a premium workspace rather than a crowded diagram.
 */
export function computeLayout(nodes: MetadataNode[], edges: MetadataEdge[]): Record<string, XY> {
  const pos: Record<string, XY> = {};

  // Column x-positions along the lineage spine.
  const sourcesX     = 0;
  const stagingX     = COL_WIDTH * 1;
  const etlX         = COL_WIDTH * 2;
  const consolidatedX = COL_WIDTH * 3;
  const reportsX     = COL_WIDTH * 4;

  const isStaging     = (n: MetadataNode) => n.category === 'Table' && n.schema === 'staging';
  const isConsolidated = (n: MetadataNode) => n.category === 'Table' && n.schema !== 'staging';

  const sources     = nodes.filter((n) => n.category === 'Source System');
  const staging     = nodes.filter(isStaging);
  const jobs        = nodes.filter((n) => n.category === 'ETL Job');
  const consolidated = nodes.filter(isConsolidated);
  const reports     = nodes.filter((n) => n.category === 'Report');
  const domains     = nodes.filter((n) => n.category === 'Business Domain');
  const teams       = nodes.filter((n) => n.category === 'Team');
  const dqRules     = nodes.filter((n) => n.category === 'Data Quality Rule');
  const columns     = nodes.filter((n) => n.category === 'Column');
  const dbSchema    = nodes.filter((n) => n.category === 'Database' || n.category === 'Schema');

  // Vertically center a group of nodes around y=0 within a column.
  function placeColumn(group: MetadataNode[], x: number, gap = ROW_HEIGHT) {
    const total = (group.length - 1) * gap;
    group.forEach((n, i) => {
      pos[n.id] = { x, y: i * gap - total / 2 };
    });
  }

  placeColumn(sources,     sourcesX);
  placeColumn(staging,     stagingX);
  placeColumn(jobs,        etlX);
  placeColumn(consolidated, consolidatedX, ROW_HEIGHT * 1.35);
  placeColumn(reports,     reportsX);

  // ── Business Domains — arc above the spine ──────────────────────────────────
  const topY = -((consolidated.length - 1) * ROW_HEIGHT * 1.35) / 2 - 320;
  domains.forEach((n, i) => {
    const spread = COL_WIDTH * 4;
    const step = domains.length > 1 ? spread / (domains.length - 1) : 0;
    pos[n.id] = { x: COL_WIDTH * 0.5 + i * step, y: topY };
  });

  // ── Teams — row below the spine ─────────────────────────────────────────────
  const botY = ((consolidated.length - 1) * ROW_HEIGHT * 1.35) / 2 + 320;
  teams.forEach((n, i) => {
    const spread = COL_WIDTH * 3;
    const step = teams.length > 1 ? spread / (teams.length - 1) : 0;
    pos[n.id] = { x: COL_WIDTH * 1.2 + i * step, y: botY };
  });

  // ── Database + Schemas — lower-left cluster ──────────────────────────────────
  dbSchema.forEach((n, i) => {
    pos[n.id] = { x: stagingX + 40, y: botY - 90 + i * 100 };
  });

  // ── DQ Rules — just to the right of their validated table ───────────────────
  const dqByTable = new Map<string, MetadataNode[]>();
  for (const r of dqRules) {
    const e = edges.find((ed) => ed.target === r.id && ed.relationship === 'validated by');
    const tableId = e?.source ?? '__none__';
    const arr = dqByTable.get(tableId) ?? [];
    arr.push(r);
    dqByTable.set(tableId, arr);
  }
  let dqFallback = 0;
  for (const [tableId, rules] of dqByTable) {
    const anchor = pos[tableId];
    rules.forEach((r, i) => {
      if (anchor) {
        pos[r.id] = { x: anchor.x + 160, y: anchor.y + 100 + i * 90 };
      } else {
        pos[r.id] = { x: consolidatedX + 160, y: botY - 200 + dqFallback++ * 90 };
      }
    });
  }

  // ── Columns — fanned beside their parent table ───────────────────────────────
  const colByTable = new Map<string, MetadataNode[]>();
  for (const c of columns) {
    const e = edges.find((ed) => ed.source === c.id && ed.relationship === 'belongs to');
    const tableId = e?.target ?? '__none__';
    const arr = colByTable.get(tableId) ?? [];
    arr.push(c);
    colByTable.set(tableId, arr);
  }
  for (const [tableId, cols] of colByTable) {
    const anchor = pos[tableId];
    const total = (cols.length - 1) * 72;
    cols.forEach((c, i) => {
      if (anchor) {
        pos[c.id] = { x: anchor.x - 200, y: anchor.y - total / 2 + i * 72 };
      } else {
        pos[c.id] = { x: consolidatedX - 200, y: i * 72 };
      }
    });
  }

  // ── Safety net — any node not yet placed ─────────────────────────────────────
  let stray = 0;
  for (const n of nodes) {
    if (!pos[n.id]) {
      pos[n.id] = {
        x: reportsX + 240 + (stray % 3) * 220,
        y: botY + Math.floor(stray / 3) * 100,
      };
      stray++;
    }
  }

  return pos;
}
