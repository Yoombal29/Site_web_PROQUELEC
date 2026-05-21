-- Create users table for authentication
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role public.app_role DEFAULT 'user',
    email_confirmed BOOLEAN DEFAULT false,
    confirmation_token TEXT,
    reset_token TEXT,
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create index on confirmation token
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON public.users(confirmation_token);

-- Create index on reset token
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON public.users(reset_token);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create default admin user (password: admin123)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO public.users (email, password_hash, full_name, role, email_confirmed)
VALUES (
    'admin@proquelec.sn',
    '$2b$10$rN3qLJEhYmVZ8K1qGxGvD.Y3kx9xKfWr5T0h8x8V9K0VQvYKr0Z.e',
    'Admin PROQUELEC',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;
