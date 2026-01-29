# 🔧 Action Requise: Exécuter la Migration SQL

## ✅ Étape 1 - COMPLÉTÉE
Pages créées dans Supabase ✅

## ⏳ Étape 2 - À FAIRE
**Exécuter le SQL de migration pour ajouter les colonnes de design**

### 1️⃣ Accédez à Supabase Dashboard
- Allez sur: https://app.supabase.com
- Connectez-vous avec vos credentials

### 2️⃣ Ouvrez l'SQL Editor
- Menu gauche → SQL Editor
- Créez une nouvelle query

### 3️⃣ Copiez-collez ce SQL:

```sql
-- Add design_options column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS design_options JSONB DEFAULT jsonb_build_object(
  'layout', 'default',
  'hero_enabled', true,
  'hero_height', 'medium',
  'hero_overlay', 0.3,
  'hero_alignment', 'center',
  'content_width', 'default',
  'sidebar_enabled', false,
  'sidebar_position', 'right',
  'footer_cta_enabled', true,
  'background_color', '#ffffff',
  'accent_color', '#0066cc',
  'text_color', '#333333',
  'heading_font', 'sans-serif',
  'body_font', 'sans-serif',
  'custom_css', '',
  'custom_sections', '[]'::jsonb
);

-- Add layout_type column for template selection
ALTER TABLE pages ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'standard' CHECK (layout_type IN (
  'standard', 'blog', 'landing', 'gallery', 'testimonials', 'pricing', 'contact', 'services', 'team', 'portfolio'
));

-- Add seo_options column
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_options JSONB DEFAULT jsonb_build_object(
  'focus_keyword', '',
  'meta_description', '',
  'canonical_url', '',
  'og_image', '',
  'og_title', '',
  'og_description', '',
  'twitter_card', 'summary',
  'schema_type', 'WebPage'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_design_options ON pages USING GIN (design_options);
CREATE INDEX IF NOT EXISTS idx_pages_layout_type ON pages(layout_type);
```

### 4️⃣ Cliquez "Run"
- Attendez le message de succès ✅

### 5️⃣ Retournez au Terminal
Une fois le SQL exécuté, lancez:

```bash
npm run dev
```

---

## 📝 Notes
- Les pages sont déjà créées dans Supabase
- Les colonnes design_options, layout_type et seo_options seront peuplées avec leurs valeurs par défaut
- Après l'ajout des colonnes, vous pourrez éditer les pages via l'admin

---

**Une fois fait, votre site sera prêt! 🚀**
