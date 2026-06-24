// ---------------------------------------------------------------------------
// Core metadata domain types
// ---------------------------------------------------------------------------

export type NodeCategory =
  | 'Business Domain'
  | 'Source System'
  | 'Database'
  | 'Schema'
  | 'Table'
  | 'Column'
  | 'ETL Job'
  | 'Report'
  | 'Team'
  | 'Data Quality Rule';

export type RelationshipType =
  | 'feeds into'
  | 'creates'
  | 'joins to'
  | 'consumed by'
  | 'owned by'
  | 'belongs to'
  | 'validated by';

export type Criticality = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MetadataNode {
  id: string;
  label: string;
  category: NodeCategory;
  /** A more specific sub-type, e.g. "Consolidated Table", "Daily Batch". */
  type?: string;
  description?: string;
  domain?: string;
  system?: string;
  database?: string;
  schema?: string;
  owner?: string;
  refreshCadence?: string;
  criticality?: Criticality;
  status?: string;
  rowCount?: number;
  pii?: boolean;
  sensitive?: boolean;
  dataQualityScore?: number; // 0-100
  lastRefresh?: string;
}

export interface MetadataEdge {
  id: string;
  source: string;
  target: string;
  relationship: RelationshipType;
}

export interface MetadataGraph {
  metadataNodes: MetadataNode[];
  metadataEdges: MetadataEdge[];
}
