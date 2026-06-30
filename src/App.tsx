import { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import type { NodeCategory, RelationshipType } from './types';
import { metadataNodes, metadataEdges } from './data/metadata';
import { computeLayout } from './lib/layout';
import { getNeighborhood } from './lib/lineage';
import { CATEGORY_ORDER, RELATIONSHIP_ORDER } from './lib/theme';
import GraphCanvas from './components/GraphCanvas';
import GravityGraph from './components/GravityGraph';
import Toolbar from './components/Toolbar';
import ControlsBar from './components/ControlsBar';
import SidePanel, { type PanelTab } from './components/SidePanel';

const HIERARCHY_ID = 'Hierarchy_Base_Table';

function AppInner() {
  const rf = useReactFlow();

  const [viewMode, setViewMode] = useState<'flow' | 'gravity'>('flow');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<NodeCategory>>(
    () => new Set(),
  );
  const [hiddenRelationships, setHiddenRelationships] = useState<
    Set<RelationshipType>
  >(() => new Set());
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<PanelTab>('Category');

  // --- Derived data (stable for the session) -----------------------------
  const byId = useMemo(
    () => new Map(metadataNodes.map((n) => [n.id, n])),
    [],
  );

  const positions = useMemo(
    () => computeLayout(metadataNodes, metadataEdges),
    [],
  );

  const degree = useMemo(() => {
    const d: Record<string, number> = {};
    for (const e of metadataEdges) {
      d[e.source] = (d[e.source] ?? 0) + 1;
      d[e.target] = (d[e.target] ?? 0) + 1;
    }
    return d;
  }, []);

  const nodeCounts = useMemo(() => {
    const counts = Object.fromEntries(
      CATEGORY_ORDER.map((c) => [c, 0]),
    ) as Record<NodeCategory, number>;
    for (const n of metadataNodes) counts[n.category] += 1;
    return counts;
  }, []);

  const edgeCounts = useMemo(() => {
    const counts = Object.fromEntries(
      RELATIONSHIP_ORDER.map((r) => [r, 0]),
    ) as Record<RelationshipType, number>;
    for (const e of metadataEdges) counts[e.relationship] += 1;
    return counts;
  }, []);

  const reportIds = useMemo(
    () => metadataNodes.filter((n) => n.category === 'Report').map((n) => n.id),
    [],
  );

  // --- Selection-driven state --------------------------------------------
  const neighborhood = useMemo(
    () => (selectedId ? getNeighborhood(selectedId, metadataEdges) : null),
    [selectedId],
  );

  const selectedNode = selectedId ? byId.get(selectedId) ?? null : null;

  const searchMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return new Set<string>();
    const matches = new Set<string>();
    for (const n of metadataNodes) {
      const haystack = [
        n.label,
        n.category,
        n.type,
        n.domain,
        n.system,
        n.schema,
        n.owner,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (haystack.includes(q)) matches.add(n.id);
    }
    return matches;
  }, [search]);

  const hasSearch = search.trim().length > 0;
  const resultCount = hasSearch ? searchMatches.size : null;
  const columnsHidden = hiddenCategories.has('Column');

  // --- Handlers ----------------------------------------------------------
  const toggleCategory = useCallback((c: NodeCategory) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }, []);

  const toggleRelationship = useCallback((r: RelationshipType) => {
    setHiddenRelationships((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  }, []);

  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    setTab('Selection');
  }, []);

  const onResetSelection = useCallback(() => setSelectedId(null), []);

  const onShowAll = useCallback(() => {
    setHiddenCategories(new Set());
    setHiddenRelationships(new Set());
  }, []);

  const onToggleColumns = useCallback(() => toggleCategory('Column'), [
    toggleCategory,
  ]);

  const onFocusHierarchy = useCallback(() => {
    const p = positions[HIERARCHY_ID];
    onSelect(HIERARCHY_ID);
    if (p) {
      // Nudge toward the dot center (top-center of the node wrapper).
      rf.setCenter(p.x + 20, p.y + 16, { zoom: 1.15, duration: 650 });
    }
  }, [positions, onSelect, rf]);

  const onFocusReports = useCallback(() => {
    rf.fitView({
      nodes: reportIds.map((id) => ({ id })),
      padding: 0.35,
      duration: 650,
    });
  }, [reportIds, rf]);

  const onResetGraph = useCallback(() => {
    setSelectedId(null);
    setSearch('');
    setHiddenCategories(new Set());
    setHiddenRelationships(new Set());
    setTab('Category');
    rf.fitView({ padding: 0.2, duration: 650 });
  }, [rf]);

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas text-ink overflow-hidden">
      <Toolbar
        search={search}
        setSearch={setSearch}
        resultCount={resultCount}
        onResetSelection={onResetSelection}
        hasSelection={!!selectedId}
      />

      <div className="flex-1 flex min-h-0">
        <div className="relative flex-1 min-w-0">
          {viewMode === 'gravity' ? (
            <GravityGraph />
          ) : (
            <>
              <GraphCanvas
                nodes={metadataNodes}
                edges={metadataEdges}
                positions={positions}
                byId={byId}
                degree={degree}
                selectedId={selectedId}
                neighborhood={neighborhood}
                hiddenCategories={hiddenCategories}
                hiddenRelationships={hiddenRelationships}
                searchMatches={searchMatches}
                hasSearch={hasSearch}
                onSelect={onSelect}
                onClearSelection={onResetSelection}
              />
              <ControlsBar
                columnsHidden={columnsHidden}
                onShowAll={onShowAll}
                onToggleColumns={onToggleColumns}
                onFocusHierarchy={onFocusHierarchy}
                onFocusReports={onFocusReports}
                onResetGraph={onResetGraph}
              />
            </>
          )}

          {/* View mode toggle */}
          <button
            onClick={() => setViewMode((v) => v === 'flow' ? 'gravity' : 'flow')}
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 h-8 px-3 rounded-md text-[11.5px] font-medium text-ink-dim hover:text-ink bg-panel/85 hover:bg-panel-2 backdrop-blur border border-line transition-colors shadow-xl whitespace-nowrap"
          >
            {viewMode === 'gravity' ? '← Flow View' : 'Gravity Field →'}
          </button>
        </div>

        {viewMode === 'flow' && (
          <SidePanel
            tab={tab}
            setTab={setTab}
            selectedNode={selectedNode}
            edges={metadataEdges}
            byId={byId}
            onSelectNode={onSelect}
            nodeCounts={nodeCounts}
            edgeCounts={edgeCounts}
            hiddenCategories={hiddenCategories}
            hiddenRelationships={hiddenRelationships}
            toggleCategory={toggleCategory}
            toggleRelationship={toggleRelationship}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
}
