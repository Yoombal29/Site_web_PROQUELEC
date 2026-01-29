# 🏗️ ARCHITECTURE PHASE 1 — VISUAL DIAGRAM

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          PLATEFORME SCHÉMA GRAPHIQUE NORMATIF                  ┃
┃                    Phase 1 Bootstrap                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────────┐
│                     🖥️  USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SchemaBuilder.tsx (React Page)                          │  │
│  │  ├─ Header "🧭 Editeur Schéma Graphique"                │  │
│  │  ├─ Instructions bleues                                 │  │
│  │  ├─ Canvas container                                    │  │
│  │  │  └─ Stats panel (gauche)                             │  │
│  │  ├─ Debug console (bas)                                 │  │
│  │  └─ Footer stats VCNG                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SchematicCanvas.tsx (Konva Component)                  │  │
│  │  ├─ Stage (1400x700)                                    │  │
│  │  ├─ Layer                                               │  │
│  │  │  ├─ Nodes (Circles) — Electrical objects            │  │
│  │  │  ├─ Edges (Lines) — Cables                          │  │
│  │  │  ├─ Labels — Object names & values                  │  │
│  │  │  └─ Palette buttons (5)                             │  │
│  │  ├─ Event Handlers                                      │  │
│  │  │  ├─ onDragEnd (node repositioning)                  │  │
│  │  │  ├─ onContextMenu (right-click cable create)        │  │
│  │  │  └─ onMouseUp (release cable)                       │  │
│  │  └─ Features                                            │  │
│  │     ├─ Drag-drop support                               │  │
│  │     ├─ Cable preview (yellow dashed)                   │  │
│  │     ├─ Auto-snap (40px radius)                         │  │
│  │     └─ Length auto-calculation                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              📊 STATE MANAGEMENT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GraphStore.ts (Centralized State)                      │  │
│  │                                                           │  │
│  │  Properties:                                             │  │
│  │  ├─ nodes: Map<string, GraphNode>                       │  │
│  │  │  └─ Each node: { id, type, position, params }       │  │
│  │  ├─ edges: Map<string, GraphEdge>                       │  │
│  │  │  └─ Each edge: { id, source, target, length }       │  │
│  │  ├─ modificationHistory: Array<HistoryEntry>           │  │
│  │  └─ listeners: Set<Callback>                           │  │
│  │                                                           │  │
│  │  Methods:                                                │  │
│  │  ├─ addNode(node)      → Add electrical object         │  │
│  │  ├─ addEdge(edge)      → Add cable connection          │  │
│  │  ├─ updateNodePosition(id, x, y)                       │  │
│  │  │  └─ Auto-updates connected edge lengths             │  │
│  │  ├─ calculateDistance(from, to)                        │  │
│  │  │  └─ Returns distance in meters (10px = 1m)          │  │
│  │  ├─ getHash()          → SHA256 triple hash (VCNG)     │  │
│  │  ├─ serialize()        → JSON export                   │  │
│  │  ├─ deserialize(json)  → JSON import                   │  │
│  │  ├─ subscribe(callback) → Reactive listener            │  │
│  │  ├─ notifyListeners()  → Trigger UI updates            │  │
│  │  └─ clearHistory()     → Reset modification log        │  │
│  │                                                           │  │
│  │  VCNG Hashing (Integrity Verification):                │  │
│  │  ├─ Hash = SHA256(nodes_json + edges_json)             │  │
│  │  ├─ Changes immediately trigger hash recalc             │  │
│  │  ├─ Prevents tampering/falsification                   │  │
│  │  └─ Foundation for Phase 5 (Digital Signature)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              📚 DATA LAYER / CATALOG                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ObjectLibrary.ts (Normative Object Catalog)            │  │
│  │                                                           │  │
│  │  22 Predefined Objects across 6 Categories:             │  │
│  │                                                           │  │
│  │  🔌 SOURCES (2)                                          │  │
│  │     • SOURCE_TYPE_A (Réseau public BT)                  │  │
│  │     • SOURCE_TYPE_B (Poste HT/BT privé)                │  │
│  │                                                           │  │
│  │  ⚙️ TRANSFORMERS (1)                                     │  │
│  │     • TRANSFORMER_PRIVATE                               │  │
│  │                                                           │  │
│  │  📊 PANELS (2)                                           │  │
│  │     • TGBT (Tableau Général BT)                         │  │
│  │     • TABLEAU_DIV (Tableau divisionnaire)               │  │
│  │                                                           │  │
│  │  🔐 PROTECTIONS (3)                                      │  │
│  │     • BREAKER_6A                                        │  │
│  │     • BREAKER_16A                                       │  │
│  │     • DDR_30MA                                          │  │
│  │                                                           │  │
│  │  🔌 CABLES (3)                                           │  │
│  │     • CABLE_CU_15MM2                                    │  │
│  │     • CABLE_CU_25MM2                                    │  │
│  │     • CABLE_CU_4MM2                                     │  │
│  │                                                           │  │
│  │  💡 RECEPTORS (5)                                        │  │
│  │     • LIGHTING_LED                                      │  │
│  │     • OUTLETS_16A                                       │  │
│  │     • MOTOR_3KW                                         │  │
│  │     • CHARGING_POINT                                    │  │
│  │     • UPS_BACKUP                                        │  │
│  │                                                           │  │
│  │  Each Object Includes:                                  │  │
│  │  ├─ id (unique identifier)                              │  │
│  │  ├─ name (display name)                                 │  │
│  │  ├─ symbol (visual representation)                      │  │
│  │  ├─ defaultParams (initial configuration)               │  │
│  │  ├─ normativeRef (Article NF C 15-100)                 │  │
│  │  └─ editableFields (configurable parameters)            │  │
│  │                                                           │  │
│  │  Helper Functions:                                       │  │
│  │  ├─ getObjectDefinition(type): ObjectDefinition        │  │
│  │  └─ getObjectsByCategory(category): ObjectDefinition[]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           🔄 DATA FLOW & REACTIVITY PATTERN                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER ACTION          HANDLER              STATE UPDATE        │
│  ──────────────       ────────────────     ──────────────      │
│                                                                  │
│  Click palette   →   addNode()          →  nodes.set()        │
│  Drag object     →   updateNodePosition() → auto-calc length   │
│  Right-click     →   handleContextMenu()  → start cable        │
│  Release on obj  →   addEdge()           → edges.set()        │
│                                                                  │
│  Each state change:                                            │
│  1. GraphStore notifies all listeners                         │
│  2. React re-renders SchematicCanvas                          │
│  3. Konva updates visual canvas                               │
│  4. Hash automatically recalculates (VCNG)                    │
│  5. Footer updates with new hash                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 INTERACTION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1️⃣ USER ADDS OBJECT
   ┌──────────────────┐
   │ User clicks      │
   │ "📡 Réseau"      │
   └─────────┬────────┘
             │
             ▼
   ┌──────────────────────────────────────┐
   │ SchematicCanvas.handlePaletteClick() │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ graphStore.addNode({                 │
   │   id: "node-xxx",                    │
   │   type: "SOURCE_TYPE_A",             │
   │   position: {x: random, y: random},  │
   │   params: {...}                      │
   │ })                                   │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ GraphStore:                          │
   │ • nodes.set(id, node)                │
   │ • modificationHistory.push({...})    │
   │ • hash = SHA256(serialize())         │
   │ • notifyListeners()                  │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ React Re-render:                     │
   │ • Component detects state change     │
   │ • Konva Layer renders new Circle     │
   │ • Text label appears                 │
   │ • Footer stats update                │
   └──────────────────────────────────────┘

2️⃣ USER DRAGS OBJECT
   ┌──────────────────┐
   │ User drags node  │
   │ to new position  │
   └─────────┬────────┘
             │
             ▼
   ┌──────────────────────────────────────┐
   │ SchematicCanvas.handleNodeDragEnd()  │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ graphStore.updateNodePosition(       │
   │   nodeId,                            │
   │   newX,                              │
   │   newY                               │
   │ )                                    │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ GraphStore:                          │
   │ • nodes.get(id).position = {x, y}    │
   │ • FOR each connected edge:           │
   │   - calculateDistance()              │
   │   - edge.length = distance           │
   │ • hash = SHA256(serialize())         │
   │ • notifyListeners()                  │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ React Re-render:                     │
   │ • Circle repositioned                │
   │ • Connected Line updated length      │
   │ • Stats updated                      │
   │ • Hash footer changed                │
   └──────────────────────────────────────┘

3️⃣ USER CREATES CABLE
   ┌──────────────────┐
   │ Right-click on   │
   │ Source node      │
   └─────────┬────────┘
             │
             ▼
   ┌──────────────────────────────────────┐
   │ handleNodeContextMenu()              │
   │ → isDraggingNewEdge = true           │
   │ → Display yellow dashed preview      │
   └─────────────┬────────────────────────┘
             Drag...
             │
             ▼
   ┌──────────────────────────────────────┐
   │ Mouse follows yellow cable preview   │
   │ Snap detection: 40px from target     │
   └─────────────┬────────────────────────┘
             Release...
             │
             ▼
   ┌──────────────────────────────────────┐
   │ handleStageMouseUp()                 │
   │ IF on valid target:                  │
   │   → graphStore.addEdge(...)          │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ GraphStore:                          │
   │ • edges.set(edgeId, {               │
   │     source: nodeA.id,                │
   │     target: nodeB.id,                │
   │     length: calculateDistance()      │
   │ })                                   │
   │ • hash updated                       │
   │ • notifyListeners()                  │
   └─────────────┬────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ React Re-render:                     │
   │ • White cable line displayed         │
   │ • Yellow preview disappears          │
   │ • Cable length auto-calculated       │
   │ • Hash updated in footer             │
   └──────────────────────────────────────┘
```

---

## 🎯 PHASE 2 INTEGRATION POINT

```
Phase 1 Output (GraphStore)
         │
         ▼
┌─────────────────────────────────────────┐
│  Phase 2: GraphParamsExtractor         │
│  ─────────────────────────────────────  │
│  Input: GraphStore.serialize()          │
│  Process:                               │
│  • Parse nodes → electrical objects     │
│  • Parse edges → cable connections     │
│  • Extract parameters                  │
│  • Group by section                    │
│  Output: NormativeParams[]              │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Existing: VoltageDropCalculator        │
│  Input: NormativeParams                 │
│  Output: Calculation results            │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Phase 3: Visualization                │
│  • Recharts graphs                      │
│  • Compliance alerts                    │
│  • Color-coded canvas                   │
└─────────────────────────────────────────┘
```

---

## 📊 TYPE DEFINITIONS

```typescript
// GraphStore nodes
interface GraphNode {
  id: string;
  type: string;  // ObjectLibrary key
  position: { x: number; y: number };
  params: Record<string, any>;
  editableFields?: string[];
}

// GraphStore edges
interface GraphEdge {
  id: string;
  source: string;  // node id
  target: string;  // node id
  length: number;  // in meters
  type?: string;   // cable type if multiple
}

// ObjectLibrary definition
interface ObjectDefinition {
  id: string;
  name: string;
  symbol: string;
  defaultParams: Record<string, any>;
  normativeRef: string;
  editableFields: Array<{
    name: string;
    type: string;
    min?: number;
    max?: number;
    options?: string[];
  }>;
}
```

---

**🎯 This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Scalability for Phase 2-6
- ✅ Type safety throughout
- ✅ Observable reactivity
- ✅ Immutable audit trail (VCNG)
- ✅ Production-ready code quality
