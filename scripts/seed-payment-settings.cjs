/**
 * Seed Payment Settings
 * Initializes payment provider configuration in the site_settings table.
 * Run: node scripts/seed-payment-settings.cjs
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/proquelec',
});

const DEFAULT_PROVIDERS = {
  wave: false,
  orange: false,
  free: false,
  paytech: false,
  senepay: false,
  intouch: false,
  cinetpay: false,
  flutterwave: false,
  fedapay: false,
  kkiapay: false,
  julaya: false,
  paydunya: true,
  cash: true,
};

async function seed() {
  console.log('🌱 Seeding payment settings...');

  try {
    // Upsert payment providers config
    await pool.query(
      `INSERT INTO public.site_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      ['payment_providers', JSON.stringify(DEFAULT_PROVIDERS)]
    );
    console.log('  ✅ payment_providers configured');

    // Upsert default provider
    await pool.query(
      `INSERT INTO public.site_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      ['payment_default_provider', JSON.stringify('paydunya')]
    );
    console.log('  ✅ payment_default_provider set to paydunya');

    // Upsert empty API keys
    await pool.query(
      `INSERT INTO public.site_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      ['payment_api_keys', JSON.stringify({})]
    );
    console.log('  ✅ payment_api_keys initialized');

    // Create orders table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
        plan_id INTEGER,
        plan_name VARCHAR(255),
        amount DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'XOF',
        payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
        provider VARCHAR(50),
        provider_ref VARCHAR(255),
        payment_token VARCHAR(255),
        transaction_metadata JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('  ✅ orders table ready');

    console.log('✅ Payment settings seeded successfully!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
