import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import type { NodeData } from '../mockGraphData';
import { nodeColors } from '../mockGraphData';

type Props = {
  node: { id: string; data: NodeData } | null;
  onClose: () => void;
};

export function InspectorPanel({ node, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'properties' | 'relationships'>('properties');

  if (!node) return null;

  const colors = nodeColors[node.data.color];

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 320,
        background: '#0c0e18',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: colors.glow, border: `1px solid ${colors.border}44` }}
          >
            {node.data.icon}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{node.data.label}</div>
            <div className="text-xs" style={{ color: '#475569' }}>{node.data.subtitle}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <X size={14} className="text-slate-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-5">
        {(['properties', 'relationships'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="py-3 gap-5 mr-5 text-lg font-medium capitalize transition-colors border-b-2"
            style={{
              borderColor: activeTab === tab ? colors.border : 'transparent',
              color: activeTab === tab ? '#e2e8f0' : '#475569',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === 'properties' && node.data.properties && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#334155' }}>
              Properties
            </div>
            {Object.entries(node.data.properties).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2.5 border-b border-white/4"
              >
                <span className="text-xs font-mono" style={{ color: '#475569' }}>{key}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'relationships' && node.data.relationshipCounts && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#334155' }}>
              Related Entities
            </div>
            {node.data.relationshipCounts.map(({ label, count }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/3 transition-colors cursor-pointer border border-white/4 mb-1.5"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: `${colors.glow}`,
                    border: `1px solid ${colors.border}44`,
                    color: colors.border,
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-white/5">
        <p className="text-[10px]" style={{ color: '#334155' }}>
          Click any node on the canvas to inspect it
        </p>
      </div>
    </div>
  );
}
