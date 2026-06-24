import type { MetadataEdge, MetadataNode } from '../types';

export interface XY {
  x: number;
  y: number;
}

// Layout geometry constants.
const COL_WIDTH = 360;
const ROW_HEIGHT = 150;

/**
 * Deterministic layered layout, left -> right along the lineage flow:
 *   Sources | Staging | ETL Jobs | Consolidated | Reports
 * with Business Domains across the top, Teams across the bottom,
 * Data Quality Rules below their consolidated tables, and Columns
 * clustered tightly to the right of their parent table.
 *
 * Deterministic placement (vs. random force layout) keeps the demo stable
 * across reloads — better for a VP walkthrough.
 */
export function computeLayout(nodes: MetadataNode[], edges: MetadataEdge[]): Record<string, XY> {
  const pos: Record<string, XY> = {};

  const stagingX = COL_WIDTH * 1;
  const etlX = COL_WIDTH * 2;
  const consolidatedX = COL_WIDTH * 3;
  const reportsX = COL_WIDTH * 4;
  const sourcesX = COL_WIDTH * 0;

  const isStaging = (n: MetadataNode) => n.category === 'Table' && n.schema === 'staging';
  const isConsolidated = (n: MetadataNode) =>
    n.category === 'Table' && n.schema !== 'staging';

  const sources = nodes.filter((n) => n.category === 'Source System');
  const staging = nodes.filter(isStaging);
  const jobs = nodes.filter((n) => n.category === 'ETL Job');
  const consolidated = nodes.filter(isConsolidated);
  const reports = nodes.filter((n) => n.category === 'Report');
  const domains = nodes.filter((n) => n.category === 'Business Domain');
  const teams = nodes.filter((n) => n.category === 'Team');
  const dqRules = nodes.filter((n) => n.category === 'Data Quality Rule');
  const columns = nodes.filter((n) => n.category === 'Column');
  const dbSchema = nodes.filter(
    (n) => n.category === 'Database' || n.category === 'Schema',
  );

  // Vertically center each spine column around y=0.
  const placeColumn = (group: MetadataNode[], x: number, gap = ROW_HEIGHT) => {
    const total = (group.length - 1) * gap;
    group.forEach((n, i) => {
      pos[n.id] = { x, y: i * gap - total / 2 };
    });
  };

  placeColumn(sources, sourcesX);
  placeColumn(staging, stagingX);
  placeColumn(jobs, etlX);
  placeColumn(consolidated, consolidatedX, ROW_HEIGHT * 1.4);
  placeColumn(reports, reportsX);

  // Business Domains: arc across the very top, spanning the spine width.
  const topY = -((consolidated.length - 1) * ROW_HEIGHT * 1.4) / 2 - 320;
  domains.forEach((n, i) => {
    const spread = COL_WIDTH * 4;
    const step = domains.length > 1 ? spread / (domains.length - 1) : 0;
    pos[n.id] = { x: COL_WIDTH * 0.6 + i * step, y: topY };
  });

  // Teams: row across the bottom.
  const botY = ((consolidated.length - 1) * ROW_HEIGHT * 1.4) / 2 + 300;
  teams.forEach((n, i) => {
    const spread = COL_WIDTH * 3;
    const step = teams.length > 1 ? spread / (teams.length - 1) : 0;
    pos[n.id] = { x: COL_WIDTH * 1.5 + i * step, y: botY };
  });

  // Database + schemas: small stack near the consolidated band, lower-left.
  dbSchema.forEach((n, i) => {
    pos[n.id] = { x: stagingX + 30, y: botY - 80 + i * 90 };
  });

  // Data Quality Rules: just to the right of / below their validated table.
  const dqByTable = new Map<string, MetadataNode[]>();
  for (const r of dqRules) {
    const e = edges.find((ed) => ed.source === r.id && ed.relationship === 'validated by')
      ?? edges.find((ed) => ed.target === r.id && ed.relationship === 'validated by');
    const tableId = e ? (e.source === r.id ? e.target : e.source) : undefined;
    const key = tableId ?? '__none__';
    (dqByTable.get(key) ?? dqByTable.set(key, []).get(key)!).push(r);
  }
  let dqFallback = 0;
  for (const [tableId, rules] of dqByTable) {
    const anchor = pos[tableId];
    rules.forEach((r, i) => {
      if (anchor) {
        pos[r.id] = { x: anchor.x + 150, y: anchor.y + 95 + i * 78 };
      } else {
        pos[r.id] = { x: consolidatedX + 150, y: botY - 200 + dqFallback++ * 78 };
      }
    });
  }

  // Columns: tight vertical cluster to the left of their parent table.
  const colByTable = new Map<string, MetadataNode[]>();
  for (const c of columns) {
    const e = edges.find((ed) => ed.source === c.id && ed.relationship === 'belongs to');
    const tableId = e?.target ?? '__none__';
    (colByTable.get(tableId) ?? colByTable.set(tableId, []).get(tableId)!).push(c);
  }
  for (const [tableId, cols] of colByTable) {
    const anchor = pos[tableId];
    const total = (cols.length - 1) * 70;
    cols.forEach((c, i) => {
      if (anchor) {
        pos[c.id] = { x: anchor.x - 165, y: anchor.y - total / 2 + i * 70 - 30 };
      } else {
        pos[c.id] = { x: consolidatedX - 165, y: i * 70 };
      }
    });
  }

  // Any unplaced node (safety net): drop into a loose grid bottom-right.
  let stray = 0;
  for (const n of nodes) {
    if (!pos[n.id]) {
      pos[n.id] = { x: reportsX + 200 + (stray % 3) * 160, y: botY + Math.floor(stray / 3) * 100 };
      stray++;
    }
  }

  return pos;
}
