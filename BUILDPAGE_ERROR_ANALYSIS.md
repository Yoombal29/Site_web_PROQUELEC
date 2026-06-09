# BuilderPage.tsx & GodEditorContext Error Analysis
**Date**: June 2, 2026  
**Issue**: White/blank page when accessing `/admin/builder/home`

---

## 🔍 CRITICAL ERRORS FOUND

### 1. **Missing Loading State UI (CRITICAL)**
**Severity**: 🔴 High - Causes blank page  
**Location**: `src/pages/admin/BuilderPage.tsx`, line 213-225 (`BuilderPageContent` component)

**Problem**:
```typescript
const BuilderPageContent = () => (
  <>
    <GodToolbar />
    <div className="flex-1 flex overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden bg-[#1a1a2a]">
        <div className="flex flex-1 overflow-hidden">
          <GodToolbox />
        </div>
        <GodLayers />
      </div>
      <BuilderErrorBoundary>
        <GodCanvas />
      </BuilderErrorBoundary>
      <GodSettings />
      <GodTimeline />
    </div>
  </>
);
```

The component renders all children unconditionally, but the `GodEditorProvider` is still loading the page data asynchronously. No loading indicator, spinner, or skeleton UI is displayed.

**Impact**: 
- When page loads, user sees blank canvas for 1-3 seconds (API latency)
- If the page doesn't exist (e.g., `/admin/builder/home` with no page id='home' in DB), an error toast appears but the canvas remains blank/white

**Solution**: Add loading state check:
```typescript
const BuilderPageContent = () => {
  const { isLoading } = useGodEditor();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0d0d1a]">
        <div className="text-center text-slate-400">
          <Loader2 size={32} className="animate-spin mx-auto mb-2" />
          <p>Chargement de la page...</p>
        </div>
      </div>
    );
  }
  
  return (/* existing JSX */);
};
```

---

### 2. **No Error State Display (CRITICAL)**
**Severity**: 🔴 High - Silent failures  
**Location**: `src/components/god-builder/GodEditorContext.tsx`, line 160-170

**Problem**:
```typescript
catch (error: any) {
  console.error('Erreur chargement page:', error);
  toast.error('Impossible de charger la page : ' + (error.message || 'Erreur inconnue'));
  // ← No error state saved! pageData remains null
} finally {
  setIsLoading(false);
}
```

When page fetch fails (404, no page named 'home', network error, etc.):
- Error is logged to console
- Toast message appears (might be missed by user)
- `pageData` remains `null`
- `isLoading` is set to `false`
- Canvas renders with null data → white page

**Solution**: Add error state:
```typescript
interface GodEditorContextType {
  // ... existing fields
  error: Error | null;
  hasError: boolean;
}

// In GodEditorProvider:
const [error, setError] = useState<Error | null>(null);

catch (error: any) {
  console.error('Erreur chargement page:', error);
  setError(error);
  toast.error('Impossible de charger la page : ' + (error.message || 'Erreur inconnue'));
} finally {
  setIsLoading(false);
}

// Then in BuilderPageContent:
if (error) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-[#0d0d1a]">
      <div className="text-center text-rose-400">
        <AlertCircle size={32} className="mx-auto mb-2" />
        <p className="font-semibold mb-2">Erreur lors du chargement</p>
        <p className="text-sm text-slate-400 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded transition"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
```

---

### 3. **Incorrect Page ID Handling**
**Severity**: 🟡 Medium  
**Location**: `src/pages/admin/BuilderPage.tsx`, line 200-220

**Problem**:
When accessing `/admin/builder/home`:
1. Route matches `{ path: "/admin/builder/:pageId" }`
2. `pageId = 'home'` is extracted from URL
3. `useParams()` returns `{ pageId: 'home' }`
4. `GodEditorProvider` tries to fetch `/api/admin/pages/home`
5. If no page with slug or id='home' exists → 404 error

**Expected Behavior**:
- `/admin/builder/` (no pageId) → Show page selector
- `/admin/builder/home` → Try to load page 'home', show error if not found

**Current Behavior**:
- `/admin/builder/home` → White page with error toast

**Solution**: Check if page exists before rendering:
```typescript
if (!pageId) {
  return <PageSelectorScreen />;
}

// Add a check or error handling here for invalid pageIds
return (
  <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-[#0d0d1a]">
    {/* ... */}
  </div>
);
```

---

### 4. **Missing Import: AlertCircle Icon**
**Severity**: 🟡 Medium  
**Location**: `src/pages/admin/BuilderPage.tsx`, line 10

The page imports `Loader2` but will need `AlertCircle` for error UI:
```typescript
import { 
  Zap, FileText, Plus, Search, ExternalLink, Loader2, ChevronRight,
  AlertCircle, // ← ADD THIS
  X, // ← ADD THIS
  RotateCcw, // ← ADD THIS
} from 'lucide-react';
```

---

### 5. **Race Condition in GodEditorContext**
**Severity**: 🟡 Medium  
**Location**: `src/components/god-builder/GodEditorContext.tsx`, line 48-60

**Problem**:
```typescript
export const GodEditorProvider: React.FC<GodEditorProviderProps> = ({ pageId, children }) => {
  const { actions, query, store } = useEditor(); // ← Called immediately at component mount
  // ... rest of component
```

The `useEditor()` hook is called at the top of the component. However, if the `<Editor>` component hasn't finished initializing or if there's a timing issue, this could throw an error.

**Solution**: Add error boundary or conditional hook:
```typescript
const GodEditorProvider: React.FC<GodEditorProviderProps> = ({ pageId, children }) => {
  // Don't call useEditor directly - it needs the Editor context to be ready
  // Instead, let Craft.js handle initialization and catch errors
  
  try {
    const { actions, query, store } = useEditor();
    // ... rest of implementation
  } catch (error) {
    console.error('[GodEditorProvider] useEditor failed:', error);
    // Fallback to minimal context
  }
};
```

---

### 6. **ESLint Warnings (Minor - Won't Prevent Rendering)**
**Severity**: 🟢 Low  
**Location**: Multiple files

Inline CSS styles should be moved to CSS files:
- `src/pages/admin/BuilderPage.tsx:119` - scrollbar styling
- `src/components/god-builder/GodCanvas.tsx:74, 246, 265, 284, 286, 288, 290, 755, 764, 814`
- `src/components/blocks/DynamicDataBlocks.tsx:231, 286, 348`
- `src/components/god-builder/TemplateManagerDialog.tsx:369`

These won't prevent the page from rendering, but they should be refactored.

---

## 🧪 TESTING THE ROOT CAUSE

### Test Case 1: Page doesn't exist
```bash
# Navigate to non-existent page
http://127.0.0.1:5175/admin/builder/home

# Expected: Error UI with "Page not found" message
# Actual: White/blank canvas
```

### Test Case 2: Page exists but loading is slow
```bash
# Open DevTools → Network → Slow 3G
# Navigate to valid page
http://127.0.0.1:5175/admin/builder/contact

# Expected: Loading spinner for 2-3 seconds
# Actual: Blank white canvas for 2-3 seconds
```

---

## 🛠️ RECOMMENDED FIXES (Priority Order)

### Fix 1: Add Loading UI (CRITICAL)
**File**: `src/pages/admin/BuilderPage.tsx`
**Lines**: 213-225
**Time**: 5 minutes

### Fix 2: Add Error State Display (CRITICAL)
**File**: `src/components/god-builder/GodEditorContext.tsx`
**Lines**: 30-43 (interface), 160-170 (catch block), 395-410 (provider return)
**Time**: 10 minutes

### Fix 3: Wrap GodEditorProvider in Error Boundary (HIGH)
**File**: `src/pages/admin/BuilderPage.tsx`
**Lines**: 230-240 (Editor wrapper)
**Time**: 5 minutes

### Fix 4: Add Form Accessibility Labels (MEDIUM)
**File**: `src/components/blocks/DynamicDataBlocks.tsx`
**Lines**: 176, 184, 192, 297, 301, 304, 308, 361
**Time**: 15 minutes

### Fix 5: Move Inline Styles to CSS (LOW)
**File**: Multiple
**Time**: 30 minutes

---

## 📋 DEPENDENCY CHECKLIST

✅ `@craftjs/core` - Installed and imported  
✅ `react-router-dom` - useParams, useNavigate working  
✅ `sonner` - toast notifications  
✅ `zustand` - useGodEditor store  
✅ `lucide-react` - Icons (need to add AlertCircle, X, RotateCcw)  
✅ `@/lib/api-client` - apiFetch function  
✅ `@/stores/builder-theme.store` - Theme management  
✅ `@/stores/builder-history.store` - History management  

---

## 📊 IMPACT ANALYSIS

| Component | Status | Impact |
|-----------|--------|--------|
| BuilderPageContent | 🔴 Missing Loading UI | Blank page on load |
| GodEditorContext | 🔴 No Error State | Silent failures |
| GodToolbar | 🟢 OK | Renders after loading |
| GodCanvas | 🟢 OK | Renders after loading |
| GodSettings | 🟢 OK | Renders after loading |
| GodTimeline | 🟢 OK | Renders after loading |
| BuilderErrorBoundary | 🟢 OK | Catches render errors |

---

## 🎯 EXPECTED OUTCOMES AFTER FIXES

✅ Loading spinner shows for 1-3 seconds when opening builder  
✅ Error message displays if page doesn't exist  
✅ Canvas renders successfully after page data loads  
✅ No white/blank pages  
✅ Better UX with clear feedback to user

---

## 🔗 RELATED FILES

- `src/pages/admin/BuilderPage.tsx` - Main builder page
- `src/components/god-builder/GodEditorContext.tsx` - Page data context
- `src/components/god-builder/GodToolbar.tsx` - Top toolbar
- `src/components/god-builder/GodCanvas.tsx` - Canvas rendering
- `src/components/god-builder/BuilderErrorBoundary.tsx` - Error boundary
- `src/stores/builder-history.store.ts` - History state
- `src/stores/builder-theme.store.ts` - Theme state
