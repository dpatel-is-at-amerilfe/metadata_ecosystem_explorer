import { TargetIcon, ReportIcon, EyeOffIcon, LayersIcon, ResetIcon } from './icons';

interface ControlsBarProps {
  columnsHidden: boolean;
  onShowAll: () => void;
  onToggleColumns: () => void;
  onFocusHierarchy: () => void;
  onFocusReports: () => void;
  onResetGraph: () => void;
}

export default function ControlsBar({
  columnsHidden,
  onShowAll,
  onToggleColumns,
  onFocusHierarchy,
  onFocusReports,
  onResetGraph,
}: ControlsBarProps) {
  const btn =
    'flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11.5px] font-medium text-ink-dim hover:text-ink hover:bg-panel-2 border border-transparent hover:border-line transition-colors whitespace-nowrap';

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-panel/85 backdrop-blur border border-line rounded-lg p-1 shadow-2xl">
      <button className={btn} onClick={onShowAll}>
        <LayersIcon size={14} /> Show all
      </button>
      <button
        className={`${btn} ${columnsHidden ? 'text-teal-300' : ''}`}
        onClick={onToggleColumns}
      >
        <EyeOffIcon size={14} /> {columnsHidden ? 'Show columns' : 'Hide columns'}
      </button>
      <div className="w-px h-5 bg-line mx-0.5" />
      <button className={btn} onClick={onFocusHierarchy}>
        <TargetIcon size={14} /> Focus Hierarchy_Base_Table
      </button>
      <button className={btn} onClick={onFocusReports}>
        <ReportIcon size={14} /> Focus Reports
      </button>
      <div className="w-px h-5 bg-line mx-0.5" />
      <button className={btn} onClick={onResetGraph}>
        <ResetIcon size={14} /> Reset graph
      </button>
    </div>
  );
}
