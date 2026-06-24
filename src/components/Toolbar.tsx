import { useReactFlow } from '@xyflow/react';
import { SearchIcon, ZoomInIcon, ZoomOutIcon, FitIcon, ResetIcon } from './icons';

interface ToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  resultCount: number | null;
  onResetSelection: () => void;
  hasSelection: boolean;
}

export default function Toolbar({
  search,
  setSearch,
  resultCount,
  onResetSelection,
  hasSelection,
}: ToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const tbtn =
    'grid place-items-center w-9 h-9 rounded-md text-ink-dim hover:text-ink hover:bg-panel-2 transition-colors';

  return (
    <header className="flex items-center gap-4 px-4 h-14 bg-panel border-b border-line shrink-0 z-20">
      {/* Logo / title */}
      <div className="flex items-center gap-2.5 pr-4 border-r border-line">
        <div
          className="w-7 h-7 rounded-md grid place-items-center"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #5eead4, #0f766e)',
            boxShadow: '0 0 14px rgba(45,212,191,0.45)',
          }}
        >
          <span className="text-[#04201c] font-bold text-sm leading-none">A</span>
        </div>
        <div className="leading-tight">
          <div className="text-ink font-semibold text-[13px] tracking-tight">
            AmeriLife Metadata Graph
          </div>
          <div className="text-ink-faint text-[10px] font-mono">
            lineage explorer · sample data
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <SearchIcon size={15} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tables, jobs, reports, columns…"
          className="w-full h-9 pl-9 pr-20 rounded-md bg-canvas border border-line text-[13px] text-ink placeholder:text-ink-faint outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-ink-faint">
            {resultCount} match{resultCount === 1 ? '' : 'es'}
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* Reset selection */}
      <button
        onClick={onResetSelection}
        disabled={!hasSelection}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-md text-[12px] font-medium border transition-colors ${
          hasSelection
            ? 'text-ink border-line hover:bg-panel-2'
            : 'text-ink-faint border-line-soft cursor-not-allowed'
        }`}
      >
        <ResetIcon size={14} />
        Reset selection
      </button>

      {/* Zoom group */}
      <div className="flex items-center gap-0.5 bg-canvas border border-line rounded-md p-0.5">
        <button className={tbtn} onClick={() => zoomOut({ duration: 200 })} aria-label="Zoom out">
          <ZoomOutIcon />
        </button>
        <button className={tbtn} onClick={() => zoomIn({ duration: 200 })} aria-label="Zoom in">
          <ZoomInIcon />
        </button>
        <button
          className={tbtn}
          onClick={() => fitView({ duration: 400, padding: 0.18 })}
          aria-label="Fit view"
        >
          <FitIcon />
        </button>
      </div>
    </header>
  );
}
