
-- ========================================================
-- MONETIZED RESOURCES SYSTEM (ROBUST & FUTURISTIC)
-- ========================================================

-- 1. Table for payment settings (extending site_settings)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'payment_settings') THEN
        ALTER TABLE site_settings ADD COLUMN payment_settings JSONB DEFAULT jsonb_build_object(
            'orange_money_enabled', false,
            'wave_enabled', false,
            'paydunya_enabled', false,
            'sandbox_mode', true,
            'currency', 'XOF'
        );
    END IF;
END $$;

-- 2. Resources table (Renamed to site_assets for zero-conflict)
CREATE TABLE IF NOT EXISTS public.site_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Général',
    asset_type TEXT DEFAULT 'PDF', -- PDF, DOC, VIDEO, etc.
    file_size TEXT,
    file_url TEXT NOT NULL,
    preview_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    price_fcfy DECIMAL(10, 2) DEFAULT 0,
    monetization_active BOOLEAN DEFAULT false,
    download_stats INTEGER DEFAULT 0,
    metadata JSONB DEFAULT jsonb_build_object(
        'tags', '[]'::jsonb,
        'author', 'PROQUELEC',
        'is_new', true,
        'featured', false
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions table for Resources
CREATE TABLE IF NOT EXISTS public.resource_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES public.site_assets(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    provider TEXT CHECK (provider IN ('orange_money', 'wave', 'paydunya')),
    provider_ref TEXT,
    transaction_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Public can view assets" ON public.site_assets FOR SELECT USING (true);
CREATE POLICY "Admins manage assets" ON public.site_assets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users view own resource transactions" ON public.resource_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all resource transactions" ON public.resource_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 6. Triggers for updated_at
CREATE TRIGGER tr_site_assets_updated_at BEFORE UPDATE ON public.site_assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_resource_transactions_updated_at BEFORE UPDATE ON public.resource_transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Initial High-Value Data (From image)
INSERT INTO public.site_assets (title, category, is_premium, price_fcfy, monetization_active, file_url, file_size, metadata)
VALUES 
('[GUIDE] Détermination des caractéristiques générales des installations', 'Guides', true, 5000, true, '/docs/guide_gen_install.pdf', '2.4 MB', '{"featured": true}'),
('[GUIDE] Choix et mise en œuvre des matériels', 'Guides', true, 5000, true, '/docs/guide_matos.pdf', '3.1 MB', '{"featured": true}'),
('[GUIDE] Sécurité et conformité des Installations Électriques des Marchés', 'Guides', true, 7500, true, '/docs/guide_securite_marché.pdf', '4.2 MB', '{"featured": true}'),
('[GUIDE] Installation électrique des ménages à faible revenu', 'Guides', false, 0, false, '/docs/guide_faible_revenu.pdf', '1.8 MB', '{"is_new": true}'),
('[MEMENTO] Domaine, objet et principes de la norme NS 01-001', 'Mémentos', false, 0, false, '/docs/memento_norme_base.pdf', '0.9 MB', '{}'),
('[MEMENTO] Les principaux termes techniques de la norme NS 01-001', 'Mémentos', false, 0, false, '/docs/memento_termes_techniques.pdf', '1.2 MB', '{}'),
('[MEMENTO] Protection pour assurer la sécurité', 'Mémentos', true, 2500, true, '/docs/memento_protection_securité.pdf', '1.5 MB', '{}'),
('[MEMENTO] Règles pour les installations et emplacements spécifiques', 'Mémentos', true, 3500, true, '/docs/memento_regles_specifiques.pdf', '2.1 MB', '{}'),
('[MEMENTO] Vérifications et entretien des installations', 'Mémentos', true, 3000, true, '/docs/memento_entretien.pdf', '1.7 MB', '{}')
ON CONFLICT DO NOTHING;
