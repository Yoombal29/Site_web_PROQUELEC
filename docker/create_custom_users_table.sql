
BEGIN;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Admin User
INSERT INTO public.users (email, password_hash, role, is_active)
VALUES (
    'oumarkebe@proquelec.sn',
    '$2b$10$812BJBCZRH8jZH8oCuT32e79Jg4w7fbuzYK1cSkaKlsmFXXOdF64K',
    'admin',
    true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    role = 'admin',
    is_active = true;

COMMIT;
