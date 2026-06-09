-- Payment providers configuration table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default payment settings
INSERT INTO public.site_settings (key, value) VALUES
  ('payment_providers', '{"paydunya": true, "wave": false, "orange": false, "free": false, "paytech": false, "senepay": false, "intouch": false, "cinetpay": false, "flutterwave": false, "fedapay": false, "kkiapay": false, "julaya": false}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('payment_default_provider', '"paydunya"')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('payment_api_keys', '{}')
ON CONFLICT (key) DO NOTHING;
