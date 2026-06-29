import type { Node, Edge } from '@xyflow/react';

export type NodeData = {
  label: string;
  subtitle: string;
  icon: string;
  color: 'purple' | 'teal' | 'blue' | 'orange' | 'slate';
  properties?: Record<string, string>;
  relationshipCounts?: { label: string; count: number }[];
};

export type MiniNodeData = {
  label: string;
  color: 'purple' | 'teal' | 'blue' | 'orange' | 'slate';
  parentId: string;
};

export type MiniAnimParams = {
  phase: number;
  speed: number;
  amplitudeX: number;
  amplitudeY: number;
};

// Static base positions relative to each parent — never mutated, only animation offsets are added.
export const miniBasePositions: Record<string, { x: number; y: number }> = {
  'mini-person-1':  { x: -195, y: -165 },
  'mini-person-2':  { x: -245, y:  -60 },
  'mini-person-3':  { x: -190, y:   65 },
  'mini-company-1': { x:   40, y: -150 },
  'mini-company-2': { x:  210, y:  -95 },
  'mini-company-3': { x:  295, y:   10 },
  'mini-product-1': { x:  240, y:  -65 },
  'mini-product-2': { x:  265, y:   30 },
  'mini-product-3': { x:  240, y:  120 },
  'mini-order-1':   { x: -200, y:  -50 },
  'mini-order-2':   { x: -225, y:   50 },
  'mini-order-3':   { x: -150, y:  170 },
  'mini-invoice-1': { x:  245, y:  -40 },
  'mini-invoice-2': { x:  265, y:   50 },
  'mini-invoice-3': { x:  235, y:  140 },
  'mini-address-1': { x:  170, y:  160 },
  'mini-address-2': { x:   40, y:  260 },
  'mini-address-3': { x:  -30, y:  200 },
  'mini-tag-1':     { x: -140, y:  135 },
  'mini-tag-2':     { x:   10, y:  190 },
  'mini-tag-3':     { x:  135, y:  180 },
  'mini-deep-1':    { x: -170, y:  -60 },
  'mini-deep-2':    { x: -205, y:   35 },
  'mini-deep-3':    { x: -160, y:  175 },
};

// Per-node organic drift parameters — each node has a unique phase/speed so they never move in unison.
export const miniAnimParams: Record<string, MiniAnimParams> = {
  'mini-person-1':  { phase: 0.00, speed: 0.32, amplitudeX: 20, amplitudeY: 14 },
  'mini-person-2':  { phase: 2.09, speed: 0.25, amplitudeX: 16, amplitudeY: 18 },
  'mini-person-3':  { phase: 4.18, speed: 0.38, amplitudeX: 22, amplitudeY: 12 },
  'mini-company-1': { phase: 0.52, speed: 0.28, amplitudeX: 18, amplitudeY: 20 },
  'mini-company-2': { phase: 1.57, speed: 0.41, amplitudeX: 14, amplitudeY: 16 },
  'mini-company-3': { phase: 3.66, speed: 0.22, amplitudeX: 24, amplitudeY: 10 },
  'mini-product-1': { phase: 1.05, speed: 0.35, amplitudeX: 15, amplitudeY: 22 },
  'mini-product-2': { phase: 3.14, speed: 0.30, amplitudeX: 20, amplitudeY: 14 },
  'mini-product-3': { phase: 5.23, speed: 0.44, amplitudeX: 12, amplitudeY: 18 },
  'mini-order-1':   { phase: 0.78, speed: 0.27, amplitudeX: 22, amplitudeY: 16 },
  'mini-order-2':   { phase: 2.61, speed: 0.39, amplitudeX: 17, amplitudeY: 12 },
  'mini-order-3':   { phase: 4.71, speed: 0.23, amplitudeX: 14, amplitudeY: 20 },
  'mini-invoice-1': { phase: 1.30, speed: 0.36, amplitudeX: 19, amplitudeY: 15 },
  'mini-invoice-2': { phase: 3.92, speed: 0.29, amplitudeX: 23, amplitudeY: 11 },
  'mini-invoice-3': { phase: 0.26, speed: 0.42, amplitudeX: 15, amplitudeY: 19 },
  'mini-address-1': { phase: 2.35, speed: 0.31, amplitudeX: 21, amplitudeY: 13 },
  'mini-address-2': { phase: 4.45, speed: 0.26, amplitudeX: 16, amplitudeY: 21 },
  'mini-address-3': { phase: 0.96, speed: 0.43, amplitudeX: 13, amplitudeY: 17 },
  'mini-tag-1':     { phase: 3.40, speed: 0.34, amplitudeX: 20, amplitudeY: 16 },
  'mini-tag-2':     { phase: 1.74, speed: 0.28, amplitudeX: 17, amplitudeY: 13 },
  'mini-tag-3':     { phase: 5.55, speed: 0.40, amplitudeX: 24, amplitudeY: 10 },
  'mini-deep-1':    { phase: 0.61, speed: 0.33, amplitudeX: 18, amplitudeY: 20 },
  'mini-deep-2':    { phase: 2.88, speed: 0.45, amplitudeX: 12, amplitudeY: 14 },
  'mini-deep-3':    { phase: 4.97, speed: 0.24, amplitudeX: 22, amplitudeY: 16 },
};

export const mockNodes: Node<NodeData>[] = [
  {
    id: 'person',
    type: 'graphNode',
    position: { x: 200, y: 250 },
    data: {
      label: 'Person',
      subtitle: 'Entity',
      icon: '👤',
      color: 'purple',
      properties: {
        name: 'John Doe',
        age: '32',
        email: 'john@acme.com',
        joined: '2023-01-15',
        status: 'Active',
      },
      relationshipCounts: [
        { label: 'Company', count: 2 },
        { label: 'Order', count: 4 },
        { label: 'Invoice', count: 2 },
      ],
    },
  },
  {
    id: 'company',
    type: 'graphNode',
    position: { x: 720, y: 60 },
    data: {
      label: 'Company',
      subtitle: 'Entity',
      icon: '🏢',
      color: 'teal',
      properties: {
        name: 'Acme Corp',
        industry: 'Technology',
        founded: '2010',
        employees: '540',
      },
      relationshipCounts: [
        { label: 'Person', count: 12 },
        { label: 'Product', count: 8 },
      ],
    },
  },
  {
    id: 'product',
    type: 'graphNode',
    position: { x: 960, y: 320 },
    data: {
      label: 'Product',
      subtitle: 'Entity',
      icon: '📦',
      color: 'blue',
      properties: {
        name: 'Pro License',
        sku: 'PRD-0042',
        price: '$299',
        category: 'Software',
      },
      relationshipCounts: [
        { label: 'Order', count: 18 },
        { label: 'Company', count: 3 },
      ],
    },
  },
  {
    id: 'order',
    type: 'graphNode',
    position: { x: 80, y: 560 },
    data: {
      label: 'Order',
      subtitle: 'Entity',
      icon: '🛒',
      color: 'blue',
      properties: {
        orderId: 'ORD-20045',
        date: '2024-03-10',
        total: '$598',
        status: 'Fulfilled',
      },
      relationshipCounts: [
        { label: 'Person', count: 1 },
        { label: 'Product', count: 2 },
        { label: 'Invoice', count: 1 },
      ],
    },
  },
  {
    id: 'invoice',
    type: 'graphNode',
    position: { x: 940, y: 620 },
    data: {
      label: 'Invoice',
      subtitle: 'Entity',
      icon: '🧾',
      color: 'slate',
      properties: {
        invoiceId: 'INV-8821',
        issued: '2024-03-11',
        due: '2024-04-11',
        amount: '$598',
      },
      relationshipCounts: [
        { label: 'Order', count: 1 },
        { label: 'Person', count: 1 },
      ],
    },
  },
  {
    id: 'address',
    type: 'graphNode',
    position: { x: 610, y: 490 },
    data: {
      label: 'Address',
      subtitle: 'Entity',
      icon: '📍',
      color: 'slate',
      properties: {
        street: '123 Oak Street',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
      relationshipCounts: [
        { label: 'Person', count: 3 },
        { label: 'Company', count: 1 },
      ],
    },
  },
  {
    id: 'tag',
    type: 'graphNode',
    position: { x: 370, y: 700 },
    data: {
      label: 'Tag',
      subtitle: 'Entity',
      icon: '🏷️',
      color: 'orange',
      properties: {
        name: 'enterprise',
        category: 'Tier',
        createdBy: 'admin',
      },
      relationshipCounts: [
        { label: 'Person', count: 7 },
        { label: 'Deep', count: 2 },
      ],
    },
  },
  {
    id: 'deep',
    type: 'graphNode',
    position: { x: -30, y: 360 },
    data: {
      label: 'Deep',
      subtitle: 'Entity',
      icon: '🔮',
      color: 'slate',
      properties: {
        type: 'Inference',
        model: 'v2.1',
        confidence: '0.94',
      },
      relationshipCounts: [
        { label: 'Order', count: 2 },
        { label: 'Tag', count: 5 },
      ],
    },
  },
];

// Positions below are RELATIVE to the parent node (absolute − parent.position).
// React Flow uses node.parentId + relative position so children follow the parent when dragged.
export const miniNodes: Node<MiniNodeData>[] = [
  // Person (280,320) — upper-left cluster
  { id: 'mini-person-1', type: 'miniNode', parentId: 'person', position: { x: -195, y: -165 }, data: { label: 'John Doe', color: 'purple', parentId: 'person' } },
  { id: 'mini-person-2', type: 'miniNode', parentId: 'person', position: { x: -245, y: -60 }, data: { label: 'Priya Shah', color: 'purple', parentId: 'person' } },
  { id: 'mini-person-3', type: 'miniNode', parentId: 'person', position: { x: -190, y: 65 }, data: { label: 'Marcus Lee', color: 'purple', parentId: 'person' } },
  // Company (680,140) — upper-right cluster
  { id: 'mini-company-1', type: 'miniNode', parentId: 'company', position: { x: 40, y: -150 }, data: { label: 'Acme Corp', color: 'teal', parentId: 'company' } },
  { id: 'mini-company-2', type: 'miniNode', parentId: 'company', position: { x: 210, y: -95 }, data: { label: 'BrightPath', color: 'teal', parentId: 'company' } },
  { id: 'mini-company-3', type: 'miniNode', parentId: 'company', position: { x: 295, y: 10 }, data: { label: 'Northstar', color: 'teal', parentId: 'company' } },
  // Product (760,360) — right cluster
  { id: 'mini-product-1', type: 'miniNode', parentId: 'product', position: { x: 240, y: -65 }, data: { label: 'Pro License', color: 'blue', parentId: 'product' } },
  { id: 'mini-product-2', type: 'miniNode', parentId: 'product', position: { x: 265, y: 30 }, data: { label: 'Basic Plan', color: 'blue', parentId: 'product' } },
  { id: 'mini-product-3', type: 'miniNode', parentId: 'product', position: { x: 240, y: 120 }, data: { label: 'Analytics Add-on', color: 'blue', parentId: 'product' } },
  // Order (180,560) — lower-left cluster
  { id: 'mini-order-1', type: 'miniNode', parentId: 'order', position: { x: -200, y: -50 }, data: { label: 'ORD-20045', color: 'blue', parentId: 'order' } },
  { id: 'mini-order-2', type: 'miniNode', parentId: 'order', position: { x: -225, y: 50 }, data: { label: 'ORD-20046', color: 'blue', parentId: 'order' } },
  { id: 'mini-order-3', type: 'miniNode', parentId: 'order', position: { x: -150, y: 170 }, data: { label: 'ORD-20047', color: 'blue', parentId: 'order' } },
  // Invoice (760,580) — right cluster
  { id: 'mini-invoice-1', type: 'miniNode', parentId: 'invoice', position: { x: 245, y: -40 }, data: { label: 'INV-8821', color: 'slate', parentId: 'invoice' } },
  { id: 'mini-invoice-2', type: 'miniNode', parentId: 'invoice', position: { x: 265, y: 50 }, data: { label: 'INV-8822', color: 'slate', parentId: 'invoice' } },
  { id: 'mini-invoice-3', type: 'miniNode', parentId: 'invoice', position: { x: 235, y: 140 }, data: { label: 'INV-8823', color: 'slate', parentId: 'invoice' } },
  // Address (660,520) — below cluster
  { id: 'mini-address-1', type: 'miniNode', parentId: 'address', position: { x: 170, y: 160 }, data: { label: 'Austin TX', color: 'slate', parentId: 'address' } },
  { id: 'mini-address-2', type: 'miniNode', parentId: 'address', position: { x: 40, y: 260 }, data: { label: 'Newark NJ', color: 'slate', parentId: 'address' } },
  { id: 'mini-address-3', type: 'miniNode', parentId: 'address', position: { x: -30, y: 200 }, data: { label: 'Tampa FL', color: 'slate', parentId: 'address' } },
  // Tag (420,620) — below cluster
  { id: 'mini-tag-1', type: 'miniNode', parentId: 'tag', position: { x: -140, y: 135 }, data: { label: 'enterprise', color: 'orange', parentId: 'tag' } },
  { id: 'mini-tag-2', type: 'miniNode', parentId: 'tag', position: { x: 10, y: 190 }, data: { label: 'renewal', color: 'orange', parentId: 'tag' } },
  { id: 'mini-tag-3', type: 'miniNode', parentId: 'tag', position: { x: 135, y: 180 }, data: { label: 'medicare', color: 'orange', parentId: 'tag' } },
  // Deep (80,440) — left cluster
  { id: 'mini-deep-1', type: 'miniNode', parentId: 'deep', position: { x: -170, y: -60 }, data: { label: 'model v2.1', color: 'slate', parentId: 'deep' } },
  { id: 'mini-deep-2', type: 'miniNode', parentId: 'deep', position: { x: -205, y: 35 }, data: { label: 'confidence 0.94', color: 'slate', parentId: 'deep' } },
  { id: 'mini-deep-3', type: 'miniNode', parentId: 'deep', position: { x: -160, y: 175 }, data: { label: 'inference run', color: 'slate', parentId: 'deep' } },
];

export const mockEdges: Edge[] = [
  {
    id: 'e-person-company',
    source: 'person',
    target: 'company',
    type: 'graphEdge',
    data: { label: 'EMPLOYED_BY' },
  },
  {
    id: 'e-person-order',
    source: 'person',
    target: 'order',
    type: 'graphEdge',
    data: { label: 'OWNS' },
  },
  {
    id: 'e-person-product',
    source: 'person',
    target: 'product',
    type: 'graphEdge',
    data: { label: 'PURCHASED' },
  },
  {
    id: 'e-person-address',
    source: 'person',
    target: 'address',
    type: 'graphEdge',
    data: { label: 'LIVES_AT' },
  },
  {
    id: 'e-person-tag',
    source: 'person',
    target: 'tag',
    type: 'graphEdge',
    data: { label: 'TAGGED_AS' },
  },
  {
    id: 'e-company-product',
    source: 'company',
    target: 'product',
    type: 'graphEdge',
    data: { label: 'MAKES' },
  },
  {
    id: 'e-order-product',
    source: 'order',
    target: 'product',
    type: 'graphEdge',
    data: { label: 'CONTAINS' },
  },
  {
    id: 'e-order-invoice',
    source: 'order',
    target: 'invoice',
    type: 'graphEdge',
    data: { label: 'BILLED_AS' },
  },
  {
    id: 'e-order-deep',
    source: 'order',
    target: 'deep',
    type: 'graphEdge',
    data: { label: 'HAS_DEEP' },
  },
  {
    id: 'e-deep-tag',
    source: 'deep',
    target: 'tag',
    type: 'graphEdge',
    data: { label: 'RELATED_TO' },
  },
  {
    id: 'e-invoice-address',
    source: 'invoice',
    target: 'address',
    type: 'graphEdge',
    data: { label: 'BILLED_TO' },
  },
  // Parent → instance edges (subtle, dashed)
  { id: 'pe-person-1', source: 'person', target: 'mini-person-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-person-2', source: 'person', target: 'mini-person-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-person-3', source: 'person', target: 'mini-person-3', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-company-1', source: 'company', target: 'mini-company-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-company-2', source: 'company', target: 'mini-company-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-company-3', source: 'company', target: 'mini-company-3', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-product-1', source: 'product', target: 'mini-product-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-product-2', source: 'product', target: 'mini-product-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-product-3', source: 'product', target: 'mini-product-3', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-order-1', source: 'order', target: 'mini-order-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-order-2', source: 'order', target: 'mini-order-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-order-3', source: 'order', target: 'mini-order-3', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-invoice-1', source: 'invoice', target: 'mini-invoice-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-invoice-2', source: 'invoice', target: 'mini-invoice-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-invoice-3', source: 'invoice', target: 'mini-invoice-3', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-address-1', source: 'address', target: 'mini-address-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-address-2', source: 'address', target: 'mini-address-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-address-3', source: 'address', target: 'mini-address-3', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-tag-1', source: 'tag', target: 'mini-tag-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-tag-2', source: 'tag', target: 'mini-tag-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-tag-3', source: 'tag', target: 'mini-tag-3', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-deep-1', source: 'deep', target: 'mini-deep-1', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-deep-2', source: 'deep', target: 'mini-deep-2', type: 'graphEdge', data: { label: '', isParent: true } },
  { id: 'pe-deep-3', source: 'deep', target: 'mini-deep-3', type: 'graphEdge', data: { label: '', isParent: true } },
];

export const nodeColors: Record<string, { border: string; glow: string; icon: string; badge: string }> = {
  purple: {
    border: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.32)',
    icon: '#a78bfa',
    badge: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  },
  teal: {
    border: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.28)',
    icon: '#2dd4bf',
    badge: 'bg-teal-900/60 text-teal-300 border-teal-700/50',
  },
  blue: {
    border: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.28)',
    icon: '#60a5fa',
    badge: 'bg-blue-900/60 text-blue-300 border-blue-700/50',
  },
  orange: {
    border: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.28)',
    icon: '#fb923c',
    badge: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
  },
  slate: {
    border: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.22)',
    icon: '#94a3b8',
    badge: 'bg-slate-800/60 text-slate-400 border-slate-600/50',
  },
};
