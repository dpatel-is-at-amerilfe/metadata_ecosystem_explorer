# AmeriLife Metadata Graph — POC

A polished, client-side **data-lineage graph explorer** built as a proof-of-concept.
It renders AmeriLife metadata objects (source systems, staging/consolidated tables,
ETL jobs, columns, data-quality rules, teams, reports, and business domains) as an
interactive dark "graph-database modeling tool," styled after the reference Dribbble UI.

> **Sample data only.** Everything in this app is synthetic mock metadata. No real
> AmeriLife data, credentials, or PII/PHI are included. See *Wiring in real data* below.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Production build / local preview:

```bash
npm run build
npm run preview
```

Requirements: Node 18+ and npm.

---

## What to demo

The intended walkthrough node is **`Hierarchy_Base_Table`**.

1. Open the app — the full graph lays out left → right along the lineage flow.
2. Click **Focus Hierarchy_Base_Table** in the top-left controls (or search "Hierarchy").
3. The table is highlighted along with its 1-hop neighborhood; everything else dims.
4. The right **Selection** panel shows its full metadata plus an **Explain lineage**
   summary generated from the connected edges, e.g.:

   > *Hierarchy_Base_Table is a critical-criticality consolidated table owned by
   > Carrier Data Feeds. It is created by the Hierarchy Normalization Job, validated by
   > NPN Required Check and Duplicate Agent Check, joined to PolicyConsolidated and
   > AgentMaster, and consumed by the Top 20 Producers Report and Carrier Dashboard…*

5. The **Upstream** / **Downstream** count cards reflect the lineage-flow edges only
   (meta links like *owned by* / *belongs to* highlight but don't count as lineage).
6. Click any node in the **Connections** list to walk the graph hop by hop.

Other controls (top-left, floating over the canvas): **Show all**, **Hide/Show columns**,
**Focus Reports**, **Reset graph**. Top toolbar: search (with live match count), reset
selection, and zoom in / out / fit. Bottom-right: minimap.

The **Category** tab lists node categories and link categories with live counts and
per-category eye toggles to show/hide them on the canvas.

---

## File structure

```
amerilife-metadata-graph/
├── index.html                # Vite entry; loads Inter + JetBrains Mono
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js        # custom dark palette + fonts
├── postcss.config.js
└── src/
    ├── main.tsx              # React root; imports React Flow + Tailwind CSS
    ├── App.tsx               # State owner (selection, search, visibility, focus actions)
    ├── index.css             # Tailwind layers + React Flow dark overrides
    ├── types.ts              # MetadataNode / MetadataEdge / category + relationship unions
    ├── data/
    │   └── metadata.ts       # ← THE MOCK DATA (swap this for real lineage)
    ├── lib/
    │   ├── theme.ts          # category colors/glyphs + relationship styles & ordering
    │   ├── layout.ts         # deterministic layered left→right layout
    │   └── lineage.ts        # neighborhood computation + Explain-lineage text generator
    └── components/
        ├── GraphCanvas.tsx   # React Flow wrapper; applies highlight/dim/hide flags
        ├── MetadataNode.tsx  # custom glowing node
        ├── FloatingEdge.tsx  # custom curved edge with rotated relationship label
        ├── Toolbar.tsx       # top bar: title, search, reset, zoom controls
        ├── ControlsBar.tsx   # floating quick-action buttons
        ├── SidePanel.tsx     # Category / Selection tab container
        ├── CategoryPanel.tsx # node + link category lists with counts & toggles
        ├── SelectionPanel.tsx# selected-node detail + Explain lineage + connections
        └── icons.tsx         # inline SVG icon set (no extra deps)
```

---

## Tech

- **React 18 + TypeScript**, bundled with **Vite**.
- **React Flow** (`@xyflow/react` v12) for the interactive graph (pan/zoom/drag, minimap, controls).
- **Tailwind CSS** for styling, with a custom dark palette in `tailwind.config.js`.
- Fully client-side — no backend, no network calls, no API keys.

Design choices worth noting:

- **Layout is deterministic** (a layered left→right placement in `lib/layout.ts`), not a
  random force simulation, so the graph looks identical on every reload — important for a
  stable VP walkthrough. Nodes remain individually draggable.
- **Lineage vs. metadata edges:** *feeds into / creates / joins to / consumed by* are
  treated as lineage-flow (drive upstream/downstream counts); *owned by / belongs to /
  validated by* are metadata links (highlight but don't count). This split lives in
  `lib/theme.ts`.
- **Explain lineage** is deterministic, rule-based text assembled from the selected node's
  connected edges (`lib/lineage.ts`) — no model calls.

---

## Wiring in real data

`src/data/metadata.ts` is the **single source of truth**. To connect real metadata,
replace the two exported arrays — `metadataNodes` and `metadataEdges` — with the output
of your lineage view (e.g. `VW_FULL_LINEAGE`) mapped into the `MetadataNode` /
`MetadataEdge` shapes in `src/types.ts`. Nothing else needs to change.

```ts
// MetadataNode -> { id, label, category, type?, description?, domain?, system?,
//                   database?, schema?, owner?, refreshCadence?, criticality?,
//                   status?, rowCount?, pii?, sensitive?, dataQualityScore?, lastRefresh? }
// MetadataEdge -> { id, source, target, relationship }
```

A few mapping tips:

- `category` must be one of the ten `NodeCategory` values; `relationship` one of the
  seven `RelationshipType` values (see `src/types.ts`). These drive color and layout.
- The layout in `lib/layout.ts` keys staging vs. consolidated tables off `schema === 'staging'`.
  Adjust that predicate if your schema naming differs.
- If you add new categories or relationships, extend the unions in `types.ts` and the
  style maps in `lib/theme.ts` so they pick up colors, glyphs, and panel ordering.

---

*POC — synthetic data only. Not for production use as-is.*
