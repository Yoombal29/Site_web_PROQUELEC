-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  target TEXT DEFAULT '_self',
  parent_id UUID REFERENCES menu_items(id),
  menu_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  menu_type TEXT DEFAULT 'main' CHECK (menu_type IN ('main', 'footer', 'social')),
  icon TEXT,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_order ON menu_items(menu_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_type ON menu_items(menu_type);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read active menu items" ON menu_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage menu items" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
