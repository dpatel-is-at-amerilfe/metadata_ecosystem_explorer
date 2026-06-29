import {
  LayoutDashboard,
  Share2,
  Grid3X3,
  Link2,
  Type,
  MessageSquare,
  Code2,
  Settings,
  Database,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, active: false },
  { icon: Share2, active: true },
  { icon: Grid3X3, active: false },
  { icon: Link2, active: false },
  { icon: Type, active: false },
  { icon: MessageSquare, active: false },
  { icon: Code2, active: false },
  { icon: Database, active: false },
  { icon: Settings, active: false },
];

export function LeftRail() {
  return (
    <div
      className="flex flex-col items-center py-4 gap-1.5 z-10"
      style={{
        width: 52,
        background: '#080910',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}
    >
      {/* Logo mark */}
      <div className="mb-4 w-7 h-7 rounded-md flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
        <span className="text-white text-xs font-bold">V</span>
      </div>

      {navItems.map(({ icon: Icon, active }, i) => (
        <button
          key={i}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 group"
          style={{
            background: active ? 'rgba(124,58,237,0.25)' : 'transparent',
            border: active ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
          }}
        >
          <Icon
            size={16}
            style={{ color: active ? '#a78bfa' : '#475569' }}
            className="group-hover:text-slate-300 transition-colors"
          />
        </button>
      ))}
    </div>
  );
}
