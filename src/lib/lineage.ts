import type { MetadataEdge, MetadataNode } from '../types';
import { RELATIONSHIP_STYLES } from './theme';

export interface Neighborhood {
  /** All directly connected node ids (any relationship, either direction). */
  connected: Set<string>;
  /** Connected edge ids. */
  connectedEdges: Set<string>;
  /** Upstream neighbor ids via incoming flow edges. */
  upstream: Set<string>;
  /** Downstream neighbor ids via outgoing flow edges. */
  downstream: Set<string>;
}

/** Compute the 1-hop neighborhood of a node, splitting flow lineage from meta links. */
export function getNeighborhood(nodeId: string, edges: MetadataEdge[]): Neighborhood {
  const connected = new Set<string>();
  const connectedEdges = new Set<string>();
  const upstream = new Set<string>();
  const downstream = new Set<string>();

  for (const e of edges) {
    const isFlow = RELATIONSHIP_STYLES[e.relationship].kind === 'flow';
    if (e.source === nodeId) {
      connected.add(e.target);
      connectedEdges.add(e.id);
      if (isFlow) downstream.add(e.target);
    } else if (e.target === nodeId) {
      connected.add(e.source);
      connectedEdges.add(e.id);
      if (isFlow) upstream.add(e.source);
    }
  }
  return { connected, connectedEdges, upstream, downstream };
}

/** Group a node's relationships by type, mapping to the related node labels. */
function relatedLabelsByRelationship(
  nodeId: string,
  edges: MetadataEdge[],
  byId: Map<string, MetadataNode>,
) {
  const out: Record<string, string[]> = {};
  for (const e of edges) {
    let otherId: string | null = null;
    if (e.source === nodeId) otherId = e.target;
    else if (e.target === nodeId) otherId = e.source;
    if (!otherId) continue;
    const label = byId.get(otherId)?.label ?? otherId;
    (out[e.relationship] ??= []).push(label);
  }
  return out;
}

function list(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Generate a plain-English lineage summary for a node from its connected edges.
 * Deterministic, rule-based — no model calls.
 */
export function explainLineage(
  node: MetadataNode,
  edges: MetadataEdge[],
  byId: Map<string, MetadataNode>,
): string {
  const rels = relatedLabelsByRelationship(node.id, edges, byId);

  // Edges where this node is the *target* of a relationship read in reverse,
  // so separate incoming vs outgoing for natural phrasing.
  const incoming: Record<string, string[]> = {};
  const outgoing: Record<string, string[]> = {};
  for (const e of edges) {
    if (e.source === node.id) (outgoing[e.relationship] ??= []).push(byId.get(e.target)?.label ?? e.target);
    else if (e.target === node.id) (incoming[e.relationship] ??= []).push(byId.get(e.source)?.label ?? e.source);
  }

  const crit = node.criticality ? `${node.criticality.toLowerCase()}-criticality ` : '';
  const kind = (node.type ?? node.category).toLowerCase();

  const owners = outgoing['owned by'] ?? [];
  const ownerClause = owners.length ? ` owned by ${list(owners)}` : '';

  const sentences: string[] = [];
  sentences.push(`${node.label} is a ${crit}${kind}${ownerClause}.`);

  const verbPhrases: string[] = [];

  // Created by (incoming "creates")
  const createdBy = incoming['creates'] ?? [];
  if (createdBy.length) verbPhrases.push(`created by the ${list(createdBy)}`);

  // Fed by (incoming "feeds into")
  const fedBy = incoming['feeds into'] ?? [];
  if (fedBy.length) verbPhrases.push(`built from ${list(fedBy)}`);

  // Validated by (outgoing "validated by")
  const validatedBy = outgoing['validated by'] ?? [];
  if (validatedBy.length) verbPhrases.push(`validated by ${list(validatedBy)}`);

  // Joined (outgoing "joins to")
  const joins = outgoing['joins to'] ?? [];
  if (joins.length) verbPhrases.push(`joined to ${list(joins)}`);

  // Consumed by (outgoing "consumed by")
  const consumedBy = outgoing['consumed by'] ?? [];
  if (consumedBy.length) verbPhrases.push(`consumed by ${list(consumedBy)}`);

  if (verbPhrases.length) {
    sentences.push(`It is ${list(verbPhrases)}.`);
  }

  // Membership context
  const belongsTo = outgoing['belongs to'] ?? [];
  if (belongsTo.length) {
    sentences.push(`It belongs to ${list(belongsTo)}.`);
  }

  // Outbound jobs / reports for source-side nodes (e.g. tables feeding jobs)
  const feedsForward = outgoing['feeds into'] ?? [];
  if (feedsForward.length) {
    sentences.push(`It feeds ${list(feedsForward)}.`);
  }

  // Fallback if nothing connected
  if (Object.keys(rels).length === 0) {
    return `${node.label} is a ${kind} with no recorded lineage relationships in this sample graph.`;
  }

  return sentences.join(' ');
}
