-- Initialize the users table and create the admin user

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert admin user with password 'admin123'
-- Password hash: $2b$10$Qf5sFqC8KhF5g0qLUNkI2.TmB4z8pWxIoOUaFQJBGZTYqJmZ7zjcm
INSERT INTO public.users (email, password_hash, role)
VALUES ('admin@proquelec.com', '$2b$10$Qf5sFqC8KhF5g0qLUNkI2.TmB4z8pWxIoOUaFQJBGZTYqJmZ7zjcm', 'admin')
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash, 
    role = EXCLUDED.role;

-- Verify the user was created
SELECT email, role, is_active FROM public.users WHERE email = 'admin@proquelec.com';
