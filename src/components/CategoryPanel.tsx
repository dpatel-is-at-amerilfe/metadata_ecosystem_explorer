import type { NodeCategory, RelationshipType } from '../types';
import {
  CATEGORY_STYLES,
  CATEGORY_ORDER,
  RELATIONSHIP_STYLES,
  RELATIONSHIP_ORDER,
} from '../lib/theme';
import { EyeIcon, EyeOffIcon } from './icons';

interface CategoryPanelProps {
  nodeCounts: Record<NodeCategory, number>;
  edgeCounts: Record<RelationshipType, number>;
  hiddenCategories: Set<NodeCategory>;
  hiddenRelationships: Set<RelationshipType>;
  toggleCategory: (c: NodeCategory) => void;
  toggleRelationship: (r: RelationshipType) => void;
}

function Row({
  color,
  glyph,
  label,
  count,
  hidden,
  onToggle,
}: {
  color: string;
  glyph: string;
  label: string;
  count: number;
  hidden: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-panel-2 transition-colors ${
        hidden ? 'opacity-45' : ''
      }`}
    >
      <span
        className="w-6 h-6 rounded-md grid place-items-center text-[12px] shrink-0"
        style={{
          background: `${color}1f`,
          border: `1px solid ${color}55`,
          color,
        }}
      >
        {glyph}
      </span>
      <span className="flex-1 text-[12.5px] text-ink truncate">{label}</span>
      <span className="text-[11px] font-mono text-ink-dim tabular-nums">{count}</span>
      <button
        onClick={onToggle}
        className="text-ink-faint hover:text-ink transition-colors"
        aria-label={hidden ? `Show ${label}` : `Hide ${label}`}
      >
        {hidden ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
      </button>
    </div>
  );
}

export default function CategoryPanel({
  nodeCounts,
  edgeCounts,
  hiddenCategories,
  hiddenRelationships,
  toggleCategory,
  toggleRelationship,
}: CategoryPanelProps) {
  const visibleNodeCats = CATEGORY_ORDER.filter((c) => (nodeCounts[c] ?? 0) > 0);
  const visibleEdgeCats = RELATIONSHIP_ORDER.filter((r) => (edgeCounts[r] ?? 0) > 0);

  return (
    <div className="px-3 py-3 overflow-y-auto thin-scroll flex-1">
      {/* Node categories */}
      <div className="flex items-center gap-2 px-2 mb-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">
          Node categories
        </h3>
        <span className="text-[10px] font-mono text-ink-faint bg-panel-2 rounded px-1.5 py-0.5">
          {visibleNodeCats.length}
        </span>
      </div>
      <div className="mb-5">
        {visibleNodeCats.map((c) => (
          <Row
            key={c}
            color={CATEGORY_STYLES[c].color}
            glyph={CATEGORY_STYLES[c].glyph}
            label={c}
            count={nodeCounts[c] ?? 0}
            hidden={hiddenCategories.has(c)}
            onToggle={() => toggleCategory(c)}
          />
        ))}
      </div>

      {/* Link categories */}
      <div className="flex items-center gap-2 px-2 mb-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">
          Link categories
        </h3>
        <span className="text-[10px] font-mono text-ink-faint bg-panel-2 rounded px-1.5 py-0.5">
          {visibleEdgeCats.length}
        </span>
      </div>
      <div>
        {visibleEdgeCats.map((r) => (
          <Row
            key={r}
            color={RELATIONSHIP_STYLES[r].color}
            glyph="—"
            label={r}
            count={edgeCounts[r] ?? 0}
            hidden={hiddenRelationships.has(r)}
            onToggle={() => toggleRelationship(r)}
          />
        ))}
      </div>
    </div>
  );
}
