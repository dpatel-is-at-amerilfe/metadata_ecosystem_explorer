import { Undo2, Redo2, Type, ChevronDown } from 'lucide-react';

export function CanvasToolbar() {
  return (
    <div
      className="absolute top-4 left-4 z-10 flex items-center gap-1 px-2 py-1.5 rounded-xl"
      style={{
        background: 'rgba(13,15,24,0.9)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
        <Undo2 size={13} className="text-slate-400" />
      </button>
      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
        <Redo2 size={13} className="text-slate-400" />
      </button>

      <div className="w-px h-4 bg-white/8 mx-0.5" />

      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
        <Type size={13} className="text-slate-400" />
      </button>

      <div className="w-px h-4 bg-white/8 mx-0.5" />

      <button
        className="flex items-center gap-1 px-2 h-7 rounded-lg hover:bg-white/5 transition-colors"
        style={{ color: '#94a3b8', fontSize: 11 }}
      >
        <span>100%</span>
        <ChevronDown size={10} />
      </button>
    </div>
  );
}
