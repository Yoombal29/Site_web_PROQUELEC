-- Create missing tables for dynamic systems

-- Table for page sections
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero', 'content', 'features', 'testimonials', 'cta', 'gallery', 'contact', 'newsletter', 'custom')),
  title TEXT,
  content TEXT,
  image_url TEXT,
  settings JSONB DEFAULT '{}',
  section_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for page_sections
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_type ON page_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_order ON page_sections(section_order);
CREATE INDEX IF NOT EXISTS idx_page_sections_is_visible ON page_sections(is_visible);

-- Enable RLS for page_sections
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Policies for page_sections
CREATE POLICY "Public can read visible page sections" ON page_sections
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Authenticated users can manage page sections" ON page_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for page_sections
CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table for form submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID,
  form_name TEXT,
  data JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Table for notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT,
  recipient_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own form submissions" ON form_submissions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can read all form submissions" ON form_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (auth.role() = 'authenticated');

-- Triggers
CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
