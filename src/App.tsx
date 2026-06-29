import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { LeftRail } from './components/LeftRail';
import GraphModelingCanvas from './components/GraphModelingCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { mockNodes } from './mockGraphData';
import type { NodeData } from './mockGraphData';

function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = selectedNodeId
    ? (mockNodes.find((n) => n.id === selectedNodeId) as { id: string; data: NodeData } | undefined) ?? null
    : null;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0a0b0f' }}>
      <LeftRail />
      <div style={{ position: 'relative', display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ReactFlowProvider>
          <GraphModelingCanvas
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
          />
        </ReactFlowProvider>
        <InspectorPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}

export default App;
