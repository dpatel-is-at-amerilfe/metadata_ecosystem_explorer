import type { MetadataEdge, MetadataNode, NodeCategory, RelationshipType } from '../types';
import CategoryPanel from './CategoryPanel';
import SelectionPanel from './SelectionPanel';

export type PanelTab = 'Category' | 'Selection';

interface SidePanelProps {
  tab: PanelTab;
  setTab: (t: PanelTab) => void;
  selectedNode: MetadataNode | null;
  edges: MetadataEdge[];
  byId: Map<string, MetadataNode>;
  onSelectNode: (id: string) => void;
  nodeCounts: Record<NodeCategory, number>;
  edgeCounts: Record<RelationshipType, number>;
  hiddenCategories: Set<NodeCategory>;
  hiddenRelationships: Set<RelationshipType>;
  toggleCategory: (c: NodeCategory) => void;
  toggleRelationship: (r: RelationshipType) => void;
}

export default function SidePanel(props: SidePanelProps) {
  const { tab, setTab } = props;

  const tabCls = (active: boolean) =>
    `relative px-3 py-2 text-[13px] font-medium transition-colors ${
      active ? 'text-ink' : 'text-ink-dim hover:text-ink'
    }`;

  return (
    <aside className="w-[340px] shrink-0 bg-panel border-l border-line flex flex-col z-20">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 h-12 border-b border-line shrink-0">
        <button className={tabCls(tab === 'Category')} onClick={() => setTab('Category')}>
          Category
          {tab === 'Category' && (
            <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-teal-400 rounded-full" />
          )}
        </button>
        <button className={tabCls(tab === 'Selection')} onClick={() => setTab('Selection')}>
          Selection
          {tab === 'Selection' && (
            <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-teal-400 rounded-full" />
          )}
        </button>
        {props.selectedNode && tab === 'Category' && (
          <span className="ml-auto text-[10px] font-mono text-teal-300/80">
            1 selected
          </span>
        )}
      </div>

      {tab === 'Category' ? (
        <CategoryPanel
          nodeCounts={props.nodeCounts}
          edgeCounts={props.edgeCounts}
          hiddenCategories={props.hiddenCategories}
          hiddenRelationships={props.hiddenRelationships}
          toggleCategory={props.toggleCategory}
          toggleRelationship={props.toggleRelationship}
        />
      ) : (
        <SelectionPanel
          node={props.selectedNode}
          edges={props.edges}
          byId={props.byId}
          onSelectNode={props.onSelectNode}
        />
      )}
    </aside>
  );
}
