import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { LeftRail } from './components/LeftRail';
import GraphModelingCanvas from './components/GraphModelingCanvas';
import NucleiGraphCanvas from './components/NucleiGraphCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { mockNodes } from './mockGraphData';
import type { NodeData } from './mockGraphData';

type View = 'graph' | 'nuclei';

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const pill: React.CSSProperties = {
    display: 'flex',
    background: 'rgba(10,10,20,0.88)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 3,
    gap: 2,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  };
  const btn = (v: View, label: string): React.ReactElement => {
    const active = view === v;
    return (
      <button
        key={v}
        onClick={() => onChange(v)}
        style={{
          padding: '5px 14px',
          borderRadius: 16,
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: active ? 600 : 400,
          letterSpacing: '0.04em',
          background: active ? 'rgba(168,85,247,0.18)' : 'transparent',
          color: active ? '#c084fc' : '#64748b',
          borderWidth: active ? 1 : 0,
          borderStyle: 'solid',
          borderColor: active ? '#a855f744' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        {label}
      </button>
    );
  };
  return (
    <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
      <div style={pill}>
        {btn('nuclei', 'Nuclei View')}
        {btn('graph', 'System Graph')}
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>('nuclei');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = selectedNodeId
    ? (mockNodes.find((n) => n.id === selectedNodeId) as { id: string; data: NodeData } | undefined) ?? null
    : null;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0a0a12' }}>
      <LeftRail />
      <div style={{ position: 'relative', display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ViewToggle view={view} onChange={setView} />

        {view === 'graph' ? (
          <ReactFlowProvider>
            <GraphModelingCanvas
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          </ReactFlowProvider>
        ) : (
          <ReactFlowProvider>
            <NucleiGraphCanvas />
          </ReactFlowProvider>
        )}

        {view === 'graph' && (
          <InspectorPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
