import type { NodeCategory, RelationshipType } from '../types';

export interface CategoryStyle {
  /** Solid accent color (hex). */
  color: string;
  /** Soft glow color used for halos / shadows. */
  glow: string;
  /** Short symbol/glyph shown inside the category chip. */
  glyph: string;
}

// Palette follows the brief's category mapping, tuned for a dark canvas.
export const CATEGORY_STYLES: Record<NodeCategory, CategoryStyle> = {
  'Business Domain': { color: '#a78bfa', glow: 'rgba(167,139,250,0.55)', glyph: '◆' },
  'Source System':   { color: '#fb7185', glow: 'rgba(251,113,133,0.55)', glyph: '⌁' },
  'Database':        { color: '#64748b', glow: 'rgba(100,116,139,0.5)',  glyph: '▤' },
  'Schema':          { color: '#60a5fa', glow: 'rgba(96,165,250,0.5)',   glyph: '▦' },
  'Table':           { color: '#2dd4bf', glow: 'rgba(45,212,191,0.55)',  glyph: '▥' },
  'Column':          { color: '#86efac', glow: 'rgba(134,239,172,0.45)', glyph: '·' },
  'ETL Job':         { color: '#f59e0b', glow: 'rgba(245,158,11,0.55)',  glyph: '⟳' },
  'Report':          { color: '#f472b6', glow: 'rgba(244,114,182,0.55)', glyph: '▣' },
  'Team':            { color: '#94a3b8', glow: 'rgba(148,163,184,0.45)', glyph: '⬡' },
  'Data Quality Rule': { color: '#facc15', glow: 'rgba(250,204,21,0.55)', glyph: '✓' },
};

// Display order for the category panel (lineage-spine order, then satellites).
export const CATEGORY_ORDER: NodeCategory[] = [
  'Business Domain',
  'Source System',
  'Database',
  'Schema',
  'Table',
  'Column',
  'ETL Job',
  'Report',
  'Team',
  'Data Quality Rule',
];

export interface RelationshipStyle {
  color: string;
  /** "flow" edges count toward upstream/downstream lineage; "meta" do not. */
  kind: 'flow' | 'meta';
  dashed?: boolean;
}

export const RELATIONSHIP_STYLES: Record<RelationshipType, RelationshipStyle> = {
  'feeds into':   { color: '#3b82f6', kind: 'flow' },
  'creates':      { color: '#f59e0b', kind: 'flow' },
  'joins to':     { color: '#2dd4bf', kind: 'flow', dashed: true },
  'consumed by':  { color: '#f472b6', kind: 'flow' },
  'validated by': { color: '#facc15', kind: 'meta', dashed: true },
  'owned by':     { color: '#94a3b8', kind: 'meta', dashed: true },
  'belongs to':   { color: '#a78bfa', kind: 'meta', dashed: true },
};

export const RELATIONSHIP_ORDER: RelationshipType[] = [
  'feeds into',
  'creates',
  'joins to',
  'consumed by',
  'validated by',
  'owned by',
  'belongs to',
];
