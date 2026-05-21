# BuilderPage Enhancement Roadmap

## Summary of Missing Features

BuilderPage is a powerful visual editor but lacks critical CMS features present in AdminPagesPanel. This document provides an implementation plan to bring BuilderPage to feature parity.

---

## Feature Checklist: What's Missing

### 🔴 **CRITICAL** (Blocks BuilderPage usability)

#### SEO Management
- [ ] Meta Description field (max 160 characters with counter)
- [ ] Meta Keywords field
- [ ] Meta Robots selector (index,follow / noindex,follow / index,nofollow / noindex,nofollow)
- [ ] Language Code selector (fr, en, wo)
- [ ] SEO Score calculator (0-100)
- [ ] Featured Image media selector

#### Publishing Controls
- [ ] Publish/Unpublish toggle
- [ ] Publish Date (datetime-local picker)
- [ ] Unpublish Date (datetime-local picker)
- [ ] Workflow Status (draft → review → approved → published)

#### Content Metadata
- [ ] Page Slug field (auto-generated from title)
- [ ] Page Excerpt field
- [ ] Author field
- [ ] Reading Time calculation (auto/manual)
- [ ] Categories management (add/remove tags)
- [ ] Tags management (add/remove tags)

---

### 🟠 **HIGH PRIORITY** (Major features)

#### Versioning & History
- [ ] Create Version button
- [ ] Version History panel (list with timestamps)
- [ ] Restore Version functionality
- [ ] Change Log notes

#### Analytics
- [ ] Analytics panel with metrics:
  - Views count
  - Unique Visitors
  - Average Time on Page
  - Bounce Rate

#### Preview & Theme
- [ ] Preview page before publish
- [ ] Apply theme functionality
- [ ] Template selector (default, full-width, sidebar-left, sidebar-right, landing)

#### Page-Level Code
- [ ] Custom CSS editor
- [ ] Custom JavaScript editor
- [ ] Custom Header HTML
- [ ] Custom Footer HTML

---

### 🟡 **MEDIUM PRIORITY** (Enhancement features)

#### Hero Section
- [ ] Hero Title field
- [ ] Hero Subtitle field
- [ ] Hero Background Image selector
- [ ] Hero CTA Button Text
- [ ] Hero CTA Button Link

#### Quality Indicators
- [ ] Readability Score (0-100)
- [ ] SEO Score display
- [ ] Real-time scoring

#### Administrative
- [ ] Menu Order field
- [ ] Show Hero toggle
- [ ] Show Footer toggle

---

### 🟢 **LOW PRIORITY** (Nice-to-have)

#### Utilities
- [ ] Auto-save draft
- [ ] Draft restore
- [ ] Bulk publish action
- [ ] Advanced search in pages list
- [ ] Filter by publish status
- [ ] Sort by title/date/author

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

**Goal**: Extend BuilderPage to handle page-level metadata

#### 1.1 Extend Data Model
```typescript
// Add to useBuilderStore or create new store
interface PageMetadata {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  meta_description: string;
  meta_keywords: string;
  meta_robots: 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';
  featured_image: string;
  language_code: string;
  
  // Publishing
  is_published: boolean;
  publish_date: string;
  unpublish_date: string;
  workflow_status: 'draft' | 'review' | 'approved' | 'published';
  
  // Content
  author: string;
  reading_time: number;
  categories: string[];
  tags: string[];
  
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_background_image: string;
  hero_cta_text: string;
  hero_cta_link: string;
  
  // Display Options
  template: string;
  show_hero: boolean;
  show_footer: boolean;
  
  // Code
  custom_css: string;
  custom_js: string;
  header_html: string;
  footer_html: string;
}
```

#### 1.2 Create PageMetadataPanel Component
- New right-side panel or modal for metadata
- Layout:
  - Tab 1: SEO (meta tags, keywords, robots, language, featured image)
  - Tab 2: Publishing (publish toggle, dates, workflow status)
  - Tab 3: Content (slug, excerpt, author, reading time)
  - Tab 4: Organization (categories, tags, menu order)
  - Tab 5: Hero (hero fields)
  - Tab 6: Code (CSS, JS, HTML)

#### 1.3 Modify API Integration
```typescript
// Update save logic in handleSave()
const handleSave = async () => {
  await apiFetch(`/api/admin/pages/${pageId}`, {
    method: 'PUT',
    body: JSON.stringify({
      structure_json: blocks,
      ...pageMetadata,  // Add all metadata fields
      title,
      slug,
      excerpt,
      meta_description,
      meta_keywords,
      meta_robots,
      language_code,
      is_published,
      publish_date,
      unpublish_date,
      workflow_status,
      author,
      reading_time,
      categories,
      tags,
      hero_title,
      hero_subtitle,
      hero_background_image,
      hero_cta_text,
      hero_cta_link,
      template,
      show_hero,
      show_footer,
      custom_css,
      custom_js,
      header_html,
      footer_html
    })
  });
};
```

---

### Phase 2: SEO & Publishing (Week 2)

**Goal**: Add SEO management and publishing controls

#### 2.1 Create SEO Panel Component
```typescript
// src/components/builder/SeoPanel.tsx
interface SeoPanelProps {
  data: PageMetadata;
  onUpdate: (field: keyof PageMetadata, value: any) => void;
}

export const SeoPanel: React.FC<SeoPanelProps> = ({ data, onUpdate }) => {
  // Render:
  // - Meta Description (160 char counter)
  // - Meta Keywords
  // - Meta Robots dropdown
  // - Language Code dropdown
  // - Featured Image selector
  // - SEO Score display
}
```

#### 2.2 Implement SEO Score Calculator
```typescript
// src/lib/seo-calculator.ts
export const calculateSeoScore = (
  title: string,
  content: string,
  metaDescription: string,
  metaKeywords: string,
  featuredImage: string,
  slug: string
): number => {
  let score = 0;
  
  // Title checks
  if (title.length > 0) score += 10;
  if (title.length >= 30 && title.length <= 60) score += 10;
  
  // Meta description checks
  if (metaDescription.length > 0) score += 10;
  if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 10;
  
  // Keywords
  if (metaKeywords.length > 0) score += 10;
  
  // Content quality
  if (content.length > 300) score += 10;
  if (content.includes('<h1>') || content.includes('<h2>')) score += 10;
  if (content.includes('alt=')) score += 10;
  
  // Image
  if (featuredImage) score += 10;
  
  // URL
  if (slug && slug.length > 0 && slug.length < 50) score += 10;
  
  return Math.min(score, 100);
};
```

#### 2.3 Create Publishing Panel
```typescript
// src/components/builder/PublishingPanel.tsx
interface PublishingPanelProps {
  data: PageMetadata;
  onUpdate: (field: keyof PageMetadata, value: any) => void;
}

export const PublishingPanel: React.FC<PublishingPanelProps> = ({ data, onUpdate }) => {
  // Render:
  // - Publish toggle
  // - Publish Date picker
  // - Unpublish Date picker
  // - Workflow Status selector
}
```

---

### Phase 3: Content Metadata & Hero (Week 3)

**Goal**: Add content organization and hero section management

#### 3.1 Create Content Metadata Panel
```typescript
// src/components/builder/ContentMetadataPanel.tsx
// Fields:
// - Slug (auto-generated from title)
// - Excerpt textarea
// - Author input
// - Reading time number input
// - Categories: add/remove interface
// - Tags: add/remove interface
```

#### 3.2 Create Hero Section Panel
```typescript
// src/components/builder/HeroPanel.tsx
// Fields:
// - Hero Title input
// - Hero Subtitle textarea
// - Hero Background Image selector
// - Hero CTA Button Text
// - Hero CTA Button Link
// - Show Hero toggle
```

#### 3.3 Slug Auto-Generator
```typescript
// src/lib/slug-generator.ts
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .replace(/[^a-z0-9]+/g, '-')       // Replace non-alphanum with hyphens
    .replace(/^-+|-+$/g, '');          // Trim hyphens
};
```

---

### Phase 4: Advanced Features (Week 4)

**Goal**: Add versioning, analytics, and code editing

#### 4.1 Implement Content Versioning
```typescript
// src/components/builder/VersioningPanel.tsx
// Use existing useContentVersioning hook
// Features:
// - Create Version button
// - Version list with timestamps
// - Restore Version button
// - Change log notes

// Create version before save:
const handleSave = async () => {
  // Create version
  if (editingPage) {
    await createVersion(
      editingPage.id,
      title,
      JSON.stringify({ ...pageMetadata, structure_json: blocks }),
      'Auto-save from builder'
    );
  }
  
  // Then save page
  // ...
};
```

#### 4.2 Create Code Panel
```typescript
// src/components/builder/CodePanel.tsx
interface CodePanelProps {
  data: {
    custom_css: string;
    custom_js: string;
    header_html: string;
    footer_html: string;
  };
  onUpdate: (field: string, value: string) => void;
}

export const CodePanel: React.FC<CodePanelProps> = ({ data, onUpdate }) => {
  // Render 4 textareas with syntax highlighting
  // Show warnings for deprecated HTML
};
```

#### 4.3 Add Analytics Panel
```typescript
// src/components/builder/AnalyticsPanel.tsx
// Use existing useAnalytics hook
// Display:
// - Page Views
// - Unique Visitors
// - Average Time on Page
// - Bounce Rate
// - Refresh button
```

---

### Phase 5: UI Integration (Week 5)

**Goal**: Integrate all panels into BuilderPage

#### 5.1 Redesign Right Sidebar
```
Current: PropertyPanel only (block properties)

New Layout:
┌─────────────────────────────────┐
│ Tabs:                           │
│ [Block Props] [Page Settings]   │
├─────────────────────────────────┤
│                                 │
│ When Block Selected:            │
│  - Show PropertyPanel (current) │
│                                 │
│ When No Block Selected:         │
│  - Show Page Settings Panel     │
│  - Sub-tabs:                    │
│    • SEO                        │
│    • Publishing                 │
│    • Content                    │
│    • Hero                       │
│    • Code                       │
│    • Analytics                  │
└─────────────────────────────────┘
```

#### 5.2 Update BuilderPage Structure
```typescript
// Current structure:
<div className="flex h-screen">
  <aside>Sidebar (Elements/Templates)</aside>
  <main>Canvas</main>
  <aside>PropertyPanel</aside>
</div>

// New structure:
<div className="flex h-screen">
  <aside>Sidebar (Elements/Templates)</aside>
  <main>Canvas</main>
  <aside>
    <Tabs>
      <TabTrigger>Block</TabTrigger>
      <TabTrigger>Page</TabTrigger>
      
      <TabContent>
        {selectedBlockId ? <PropertyPanel /> : <PageSettingsPanel />}
      </TabContent>
      <TabContent>
        <PageSettingsPanel />
      </TabContent>
    </Tabs>
  </aside>
</div>
```

#### 5.3 Update Toolbar
```
Current:
[Back] [Undo/Redo] [Device Selector] [Page Info] [Code] [Back] [Preview] [Save]

New:
[Back] [Undo/Redo] [Device Selector] [Page Info] 
[Code] [Preview] [Versions] [Analytics] [Publish] [Save]
```

---

### Phase 6: Migration & Testing (Week 6)

**Goal**: Migrate existing pages and ensure data integrity

#### 6.1 Migration Script
```typescript
// src/lib/migrate-pages.ts
export const migrateBuilderPages = async () => {
  // For each page using structure_json:
  // 1. Check if metadata fields are empty
  // 2. If content exists, extract metadata
  // 3. Auto-generate slug from title
  // 4. Calculate reading time
  // 5. Set defaults for missing fields
};
```

#### 6.2 Testing Checklist
- [ ] All 7 new panels render correctly
- [ ] Data saves to correct database fields
- [ ] Slug auto-generation works
- [ ] SEO score calculates correctly
- [ ] Reading time calculates correctly
- [ ] Versions create and restore properly
- [ ] Analytics load and display
- [ ] Responsive layout on different screen sizes
- [ ] Keyboard navigation works
- [ ] Form validation prevents invalid data

---

## Component File Structure

```
src/components/builder/
├── PropertyPanel.tsx (existing)
├── PageSettingsPanel.tsx (new - main container)
├── panels/
│   ├── SeoPanel.tsx
│   ├── PublishingPanel.tsx
│   ├── ContentMetadataPanel.tsx
│   ├── HeroPanel.tsx
│   ├── CodePanel.tsx
│   ├── AnalyticsPanel.tsx
│   └── VersioningPanel.tsx
├── controls/ (existing)
└── sections/ (existing)

src/lib/
├── seo-calculator.ts (new)
├── slug-generator.ts (new)
├── readability-calculator.ts (new)
└── migrate-pages.ts (new)
```

---

## Database Schema Updates

The page table needs to accommodate all new fields (most should already exist):

```sql
ALTER TABLE pages ADD COLUMN IF NOT EXISTS:
  - slug VARCHAR(255) UNIQUE
  - excerpt TEXT
  - meta_description VARCHAR(160)
  - meta_keywords VARCHAR(255)
  - meta_robots VARCHAR(50) DEFAULT 'index,follow'
  - featured_image VARCHAR(255)
  - language_code VARCHAR(5) DEFAULT 'fr'
  - is_published BOOLEAN DEFAULT FALSE
  - workflow_status VARCHAR(50) DEFAULT 'draft'
  - publish_date TIMESTAMP NULL
  - unpublish_date TIMESTAMP NULL
  - author VARCHAR(255)
  - reading_time INT DEFAULT 0
  - categories JSON
  - tags JSON
  - template VARCHAR(100) DEFAULT 'default'
  - show_hero BOOLEAN DEFAULT TRUE
  - show_footer BOOLEAN DEFAULT TRUE
  - custom_css TEXT
  - custom_js TEXT
  - header_html TEXT
  - footer_html TEXT
  - hero_title VARCHAR(255)
  - hero_subtitle TEXT
  - hero_background_image VARCHAR(255)
  - hero_cta_text VARCHAR(255)
  - hero_cta_link VARCHAR(255)
  - menu_order INT DEFAULT 0
```

---

## Estimated Effort

| Phase | Tasks | Duration | Notes |
|-------|-------|----------|-------|
| Phase 1 | Data model, store, API | 3-4 days | Core infrastructure |
| Phase 2 | SEO, publishing panels | 3-4 days | Moderate complexity |
| Phase 3 | Content, hero panels | 2-3 days | Straightforward forms |
| Phase 4 | Versioning, analytics | 3-4 days | Integration with existing hooks |
| Phase 5 | UI integration | 2-3 days | Layout restructuring |
| Phase 6 | Migration, testing | 3-4 days | Critical for data integrity |
| **Total** | **6 phases** | **4-5 weeks** | **With 1 developer** |

---

## Success Criteria

✅ **BuilderPage can now:**
- Edit all page metadata (SEO, publishing, content)
- Create and restore page versions
- View page analytics
- Manage hero section
- Add custom CSS/JS
- Calculate and display SEO score
- Auto-save drafts
- Preview before publishing
- Manage categories and tags

✅ **Feature Parity:**
- BuilderPage has 90%+ feature parity with AdminPagesPanel
- All critical CMS features implemented
- Smooth migration of existing pages

✅ **User Experience:**
- Intuitive tabbed interface
- Clear property panels
- Real-time validation
- Helpful error messages
- Responsive design

---

## Dependencies to Install

```bash
# Already likely installed:
npm list date-fns react-hook-form zod

# May need:
npm install --save-dev @types/node
```

---

## Rollback Plan

If implementation causes issues:
1. Keep AdminPagesPanel as fallback editor
2. Feature flags to toggle BuilderPage panels
3. Database backup before migration
4. Version control on all changes
5. Gradual rollout (10% users first)

---

## Future Enhancements

After Phase 6:
- AI-powered content suggestions
- SEO recommendations engine
- Collaborative editing
- Page cloning/templating
- Advanced scheduling
- A/B testing support
- Performance monitoring
