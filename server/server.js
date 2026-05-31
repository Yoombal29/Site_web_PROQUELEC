const path = require('path');
const dotenvResult = require('dotenv').config({ override: true, path: path.resolve(__dirname, '../.env') });
if (dotenvResult.error) {
    console.error('[ENV] Failed to load .env:', dotenvResult.error);
}

try {
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl) {
        const parsedUrl = new URL(dbUrl);
        console.log(`[ENV] Loaded DATABASE_URL host=${parsedUrl.hostname} port=${parsedUrl.port || '5432'} database=${parsedUrl.pathname.slice(1)}`);
    } else {
        console.log('[ENV] DATABASE_URL is not set');
    }
} catch (err) {
    console.warn('[ENV] Invalid DATABASE_URL format:', err.message);
}

const { createApp } = require('./app');
const { pool } = require('./core/database');
require('./core/logger');

const port = process.env.PORT || 3000;
const swaggerPort = process.env.SWAGGER_PORT || 3103;

// Swagger documentation server
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const swaggerSpec = require('./swagger');

const swaggerApp = require('express')();
swaggerApp.use(cors());
swaggerApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info .title { color: #2376df }',
    customSiteTitle: 'PROQUELEC API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
    }
}));

swaggerApp.get('/', (req, res) => {
    res.redirect('/api-docs');
});

swaggerApp.listen(swaggerPort, () => {
    console.log(`📚 Swagger API Documentation running at http://localhost:${swaggerPort}/api-docs`);
});

// Create the main app
const app = createApp();

// === Database Initialization (inherited from index.js) ===
const initDB = async () => {
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.users(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.ai_requests_log(
                id SERIAL PRIMARY KEY,
                user_id UUID, 
                page_id UUID,
                prompt TEXT,
                generated_code TEXT,
                ai_mode TEXT,
                ai_provider TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.pages(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT,
            excerpt TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            meta_robots TEXT DEFAULT 'index,follow',
            featured_image TEXT,
            template TEXT DEFAULT 'default',
            show_hero BOOLEAN DEFAULT true,
            show_footer BOOLEAN DEFAULT true,
            custom_css TEXT,
            custom_js TEXT,
            header_html TEXT,
            footer_html TEXT,
            hero_title TEXT,
            hero_subtitle TEXT,
            hero_background_image TEXT,
            hero_cta_text TEXT,
            hero_cta_link TEXT,
            is_published BOOLEAN DEFAULT false,
            status TEXT DEFAULT 'draft',
            publish_date TIMESTAMP WITH TIME ZONE,
            unpublish_date TIMESTAMP WITH TIME ZONE,
            menu_order INTEGER DEFAULT 0,
            categories TEXT[],
            tags TEXT[],
            author TEXT,
            reading_time INTEGER DEFAULT 0,
            content_blocks JSONB DEFAULT '[]',
            design_options JSONB DEFAULT '{}',
            seo_options JSONB DEFAULT '{}',
            parent_id UUID REFERENCES public.pages(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.page_versions(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
            version INTEGER NOT NULL,
            content_raw TEXT,
            content_hash TEXT,
            diff_from_previous JSONB,
            created_by UUID,
            ai_history JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.page_templates(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                structure JSONB DEFAULT '{}',
                theme_config JSONB DEFAULT NULL,
                category TEXT DEFAULT NULL,
                tags TEXT[] DEFAULT NULL,
                thumbnail TEXT DEFAULT NULL,
                is_system BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.orders(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_ref TEXT NOT NULL UNIQUE,
                items JSONB DEFAULT '[]',
                total NUMERIC(12,2) NOT NULL,
                subtotal NUMERIC(12,2) NOT NULL,
                shipping NUMERIC(12,2) DEFAULT 0,
                tax NUMERIC(12,2) DEFAULT 0,
                currency TEXT DEFAULT 'XOF',
                customer JSONB DEFAULT '{}',
                status TEXT DEFAULT 'pending',
                payment_status TEXT DEFAULT 'pending',
                payment_provider TEXT DEFAULT 'paydunya',
                payment_token TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        await pool.query('ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1');
        await pool.query('ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT \'[]\'');
        await pool.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true');
        await pool.query('ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT \'draft\'');
        await pool.query('ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT \'draft\'');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.document_workflow_transitions(
                id SERIAL PRIMARY KEY,
                entity_id UUID NOT NULL,
                entity_type TEXT NOT NULL,
                from_state TEXT,
                to_state TEXT NOT NULL,
                changed_by UUID,
                comment TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_document_workflow_transitions_entity_id ON public.document_workflow_transitions(entity_id);
        `);

        await pool.query(`
        CREATE TABLE IF NOT EXISTS public.construction_mode(
            id INTEGER PRIMARY KEY,
            is_enabled BOOLEAN DEFAULT false,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_by UUID
        );
        INSERT INTO public.construction_mode (id, is_enabled) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

        CREATE OR REPLACE FUNCTION public.auto_page_versioning() RETURNS TRIGGER AS $$
        DECLARE
            previous_content TEXT;
            previous_hash TEXT;
            diff JSONB;
        BEGIN
            IF TG_OP = 'UPDATE' AND NEW.version IS NOT NULL AND OLD.version IS NOT NULL AND NEW.version <= OLD.version THEN
                RETURN NEW;
            END IF;
            SELECT content_raw, content_hash
            INTO previous_content, previous_hash
            FROM public.page_versions
            WHERE page_id = NEW.id
            ORDER BY version DESC
            LIMIT 1;
            diff := jsonb_build_object(
                'previous', COALESCE(previous_content, ''),
                'new', COALESCE(NEW.content_raw, '')
            );
            INSERT INTO public.page_versions(
                page_id, version, content_raw, content_hash, diff_from_previous, created_by
            ) VALUES (
                NEW.id,
                COALESCE(OLD.version, 0) + 1,
                COALESCE(NEW.content_raw, ''),
                encode(digest(COALESCE(NEW.content_raw, ''), 'sha256'), 'hex'),
                diff,
                NULL
            );
            NEW.version := COALESCE(OLD.version, 0) + 1;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_auto_page_versioning') THEN
                CREATE TRIGGER trig_auto_page_versioning
                BEFORE UPDATE ON public.pages
                FOR EACH ROW
                EXECUTE FUNCTION public.auto_page_versioning();
            END IF;
        END $$;

            CREATE TABLE IF NOT EXISTS public.home_hero(
            id SERIAL PRIMARY KEY,
            title TEXT,
            subtitle TEXT,
            description TEXT,
            cta_text TEXT,
            cta_link TEXT,
            background_url TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.home_slides(
            id SERIAL PRIMARY KEY,
            badge TEXT,
            title TEXT,
            subtitle TEXT,
            description TEXT,
            background_url TEXT,
            cta_text TEXT,
            cta_link TEXT,
            secondary_cta_text TEXT,
            secondary_cta_link TEXT,
            display_order INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.home_stats(
            id SERIAL PRIMARY KEY,
            label TEXT,
            value TEXT,
            icon_name TEXT,
            description TEXT,
            is_warning BOOLEAN DEFAULT false,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.home_services(
            id SERIAL PRIMARY KEY,
            title TEXT,
            description TEXT,
            icon_name TEXT,
            link TEXT,
            features TEXT[],
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.testimonials(
            id SERIAL PRIMARY KEY,
            name TEXT,
            role TEXT,
            content TEXT,
            rating INTEGER DEFAULT 5,
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.site_config(
            id TEXT PRIMARY KEY,
            schema JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.contact_requests(
            id SERIAL PRIMARY KEY,
            name TEXT,
            email TEXT,
            message TEXT,
            submitted_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.documents(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            file_url TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT NOW(),
            uploader_id UUID
        );
        CREATE TABLE IF NOT EXISTS public.events(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            date TIMESTAMP NOT NULL,
            location TEXT,
            details TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            organizer_id UUID
        );
        CREATE TABLE IF NOT EXISTS public.blog_categories(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS public.blog_posts(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            content TEXT,
            excerpt TEXT,
            slug TEXT NOT NULL UNIQUE,
            cover_image_url TEXT,
            category_id INTEGER REFERENCES public.blog_categories(id),
            published_at TIMESTAMP WITH TIME ZONE,
            author_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.electrical_standards(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            category TEXT,
            description TEXT,
            version TEXT,
            status TEXT,
            document_url TEXT,
            summary TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.electrical_equipment(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            category TEXT,
            description TEXT,
            price DECIMAL(10,2),
            stock_quantity INTEGER DEFAULT 0,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.professional_training(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            duration_hours INTEGER,
            level TEXT,
            price DECIMAL(10,2),
            max_participants INTEGER,
            instructor_name TEXT,
            location TEXT,
            equipment_provided BOOLEAN DEFAULT false,
            prerequisites TEXT[],
            learning_objectives TEXT[],
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.newsletter_subscribers(
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            source TEXT,
            is_active BOOLEAN DEFAULT true,
            subscribed_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.media_files(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            mime_type TEXT,
            alt_text TEXT,
            uploaded_at TIMESTAMP DEFAULT NOW(),
            uploaded_by UUID
        );
        CREATE TABLE IF NOT EXISTS public.audit_log(
            id SERIAL PRIMARY KEY,
            user_id UUID,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id TEXT,
            details JSONB,
            timestamp TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.performance_metrics(
            id SERIAL PRIMARY KEY,
            page_url TEXT,
            load_time DECIMAL,
            dom_content_loaded DECIMAL,
            first_contentful_paint DECIMAL,
            time_to_interactive DECIMAL,
            connection_type TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.analytics_events(
            id SERIAL PRIMARY KEY,
            event_type TEXT NOT NULL,
            page_url TEXT,
            device_type TEXT,
            country TEXT,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.certifications(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            certificate_number TEXT NOT NULL UNIQUE,
            holder_name TEXT NOT NULL,
            type TEXT NOT NULL,
            issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expiry_date TIMESTAMP WITH TIME ZONE,
            status TEXT DEFAULT 'active',
            metadata JSONB DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS public.audits(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            site_name TEXT NOT NULL,
            location TEXT,
            inspector_id UUID,
            audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            findings TEXT,
            compliance_score INTEGER,
            recommendations TEXT,
            metadata JSONB DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS public.electricians_network(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            specializations TEXT[],
            region TEXT,
            phone TEXT,
            email TEXT,
            rating DECIMAL(3,2) DEFAULT 0.0,
            projects_count INTEGER DEFAULT 0,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_verified BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'
        );
        
        CREATE TABLE IF NOT EXISTS public.gallery_items(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            url TEXT NOT NULL,
            type TEXT DEFAULT 'photo',
            category TEXT DEFAULT 'projets',
            tags TEXT[],
            hotspots JSONB DEFAULT '[]',
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);

        console.log('Verifying table structures...');
        await pool.query(`
            ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
            ALTER TABLE public.pages 
            ADD COLUMN IF NOT EXISTS excerpt TEXT,
        ADD COLUMN IF NOT EXISTS meta_description TEXT,
            ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
                ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index,follow',
                    ADD COLUMN IF NOT EXISTS featured_image TEXT,
                        ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'default',
                            ADD COLUMN IF NOT EXISTS show_hero BOOLEAN DEFAULT true,
                                ADD COLUMN IF NOT EXISTS show_footer BOOLEAN DEFAULT true,
                                    ADD COLUMN IF NOT EXISTS custom_css TEXT,
                                        ADD COLUMN IF NOT EXISTS custom_js TEXT,
                                            ADD COLUMN IF NOT EXISTS header_html TEXT,
                                                ADD COLUMN IF NOT EXISTS footer_html TEXT,
                                                    ADD COLUMN IF NOT EXISTS hero_title TEXT,
                                                        ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
                                                            ADD COLUMN IF NOT EXISTS hero_background_image TEXT,
                                                                ADD COLUMN IF NOT EXISTS hero_cta_text TEXT,
                                                                    ADD COLUMN IF NOT EXISTS hero_cta_link TEXT,
                                                                        ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
                                                                            ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
                                                                                ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP WITH TIME ZONE,
                                                                                    ADD COLUMN IF NOT EXISTS unpublish_date TIMESTAMP WITH TIME ZONE,
                                                                                        ADD COLUMN IF NOT EXISTS categories TEXT[],
                                                                                            ADD COLUMN IF NOT EXISTS tags TEXT[],
                                                                                                ADD COLUMN IF NOT EXISTS author TEXT,
                                                                                                    ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
                                                                                                        ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]',
                                                                                                            ADD COLUMN IF NOT EXISTS design_options JSONB DEFAULT '{}',
                                                                                                                ADD COLUMN IF NOT EXISTS seo_options JSONB DEFAULT '{}',
                                                                                                                    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.pages(id),
                                                                                                                    ADD COLUMN IF NOT EXISTS content_raw TEXT,
                                                                                                                    ADD COLUMN IF NOT EXISTS security_level TEXT DEFAULT 'public',
                                                                                                                    ADD COLUMN IF NOT EXISTS immutable BOOLEAN DEFAULT false,
                                                                                                                    ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1
        `);

        console.log('Ensuring critical pages exist...');
        const initialPages = [
            { title: 'À propos de PROQUELEC', slug: 'about', content: '<h2>Notre Mission</h2><p>PROQUELEC est l\'organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal.</p>', meta_description: 'Découvrez PROQUELEC, l\'organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal.', hero_title: 'À propos de PROQUELEC', hero_subtitle: 'L\'organisme national de référence pour la qualité électrique au Sénégal', menu_order: 1 },
            { title: 'Nos Activités', slug: 'activities', content: '<h2>Contrôle de conformité</h2><p>Vérification complète et certifications des installations conformes aux normes.</p>', meta_description: 'Découvrez toutes nos activités : contrôle de conformité, labellisation, formations, audits énergétiques.', hero_title: 'Nos Activités', hero_subtitle: 'Découvrez l\'ensemble de nos services et missions', menu_order: 2 },
            { title: 'Labels & Qualité', slug: 'labels', content: '<h2>Le Label PROQUELEC</h2><p>Le Label PROQUELEC est une marque de qualité qui garantit l\'excellence des installations électriques.</p>', meta_description: 'Découvrez le Label PROQUELEC, marque de qualité pour les professionnels de l\'électricité au Sénégal.', hero_title: 'Nos Labels', hero_subtitle: 'Le Label PROQUELEC, garantie d\'excellence professionnelle', menu_order: 3 },
            { title: 'Certifications', slug: 'certifications', content: '<h2>Programme de Certification</h2><p>Nos certifications valident vos compétences et garantissent votre expertise professionnelle.</p>', meta_description: 'Découvrez nos programmes de certification pour valider vos compétences en électricité.', hero_title: 'Certifications', hero_subtitle: 'Validez vos compétences avec nos certifications professionnelles', menu_order: 4 },
            { title: 'Documentation', slug: 'documents', content: '<h2>Centre de Documentation</h2><p>Accédez à notre bibliothèque complète de documents techniques et normes.</p>', meta_description: 'Téléchargez nos documents techniques, guides professionnels et ressources.', hero_title: 'Documents & Ressources', hero_subtitle: 'Bibliothèque complète de documents techniques', menu_order: 5 },
            { title: 'Évènements', slug: 'events', content: '<h2>Calendrier des Évènements</h2><p>Découvrez nos conférences, ateliers et webinaires.</p>', meta_description: 'Découvrez nos événements : conférences, ateliers et formations sur l\'électricité au Sénégal.', hero_title: 'Évènements', hero_subtitle: 'Conférences et ateliers professionnels', menu_order: 6 },
            { title: 'Formations', slug: 'formations', content: '<h2>Centre de Formation</h2><p>Développez vos compétences avec nos formations professionnelles.</p>', meta_description: 'Suivez nos formations professionnelles en électricité. Cours certifiés.', hero_title: 'Nos Formations', hero_subtitle: 'Développez votre expertise électrique', menu_order: 7 },
            { title: 'Expertises Techniques', slug: 'expertises-techniques', content: '<h2>Expertises Techniques</h2><p>Nos domaines d\'expertise au service de votre sécurité.</p>', meta_description: 'Découvrez les expertises techniques de PROQUELEC en installations électriques.', hero_title: 'Expertises Techniques', hero_subtitle: 'L\'excellence technique au Sénégal', menu_order: 8 },
            { title: 'Formations PROQUELEC', slug: 'formations-proquelec', content: '<h2>Formations PROQUELEC</h2><p>Découvrez nos programmes de formation avancés.</p>', meta_description: 'Programmes de formations avancés PROQUELEC pour les professionnels.', hero_title: 'Formations PROQUELEC', hero_subtitle: 'Votre avenir commence ici', menu_order: 9 },
            { title: 'Contactez-nous', slug: 'contact', content: '<h2>Contact & Localisation</h2><p>Notre équipe d\'experts est à votre entière disposition pour répondre à vos questions techniques.</p>', meta_description: 'Contactez PROQUELEC pour vos besoins d\'audit, formation ou certification électrique.', hero_title: 'Contactez-nous', hero_subtitle: 'Une équipe d\'experts à votre entière disposition', menu_order: 10 },
            { title: 'Mentions Légales', slug: 'legal', content: '<h2>Mentions Légales</h2><p>Responsable du site, hébergement et confidentialité.</p>', meta_description: 'Mentions légales et conditions d\'utilisation du site PROQUELEC.', menu_order: 100 }
        ];

        for (const p of initialPages) {
            await pool.query(
                `INSERT INTO public.pages(title, slug, content, meta_description, hero_title, hero_subtitle, menu_order, is_published, status)
    VALUES($1, $2, $3, $4, $5, $6, $7, true, 'published')
                 ON CONFLICT(slug) DO UPDATE SET
    title = EXCLUDED.title,
        content = EXCLUDED.content,
        meta_description = EXCLUDED.meta_description,
        hero_title = EXCLUDED.hero_title,
        hero_subtitle = EXCLUDED.hero_subtitle,
        menu_order = EXCLUDED.menu_order,
        updated_at = NOW()
                 WHERE pages.content != EXCLUDED.content OR pages.title != EXCLUDED.title`,
                [p.title, p.slug, p.content, p.meta_description, p.hero_title, p.hero_subtitle, p.menu_order]
            );
        }

        const configCheck = await pool.query('SELECT COUNT(*) FROM public.site_config WHERE id = $1', ['global_v1']);
        if (parseInt(configCheck.rows[0].count) === 0) {
            console.log('Seeding initial site schema...');
            const initialSchema = {
                pages: [{ id: 'home', slug: '/', title: 'Accueil', layout: [{ id: 'hero', type: 'HeroBanner', settings: {} }, { id: 'stats', type: 'StatsSection', settings: {} }, { id: 'services', type: 'ServicesGrid', settings: {} }] }],
                theme: { primary: '#2376df', secondary: '#054393', accent: '#ea580c', radius: '0.75rem', font: 'Inter' },
                globals: { header: { promoText: "", backgroundColor: "", textColor: "#ffffff" }, footer: { backgroundColor: "#111827", textColor: "#ffffff" } }
            };
            await pool.query('INSERT INTO public.site_config (id, schema) VALUES ($1, $2)', ['global_v1', JSON.stringify(initialSchema)]);
        }

        const heroCheck = await pool.query('SELECT count(*) FROM public.home_hero');
        if (parseInt(heroCheck.rows[0].count) === 0) {
            await pool.query(`INSERT INTO public.home_hero(title, subtitle, description, cta_text, cta_link)
    VALUES('93% des installations électriques', 'au Sénégal ne sont pas conformes !', 'Enquête nationale PROQUELEC 2012 - Première étude en Afrique révélant un danger imminent', 'Contrôler mon installation', '/contact')`);
        }

        const slidesCheck = await pool.query('SELECT COUNT(*) FROM public.home_slides');
        if (parseInt(slidesCheck.rows[0].count) === 0) {
            console.log('Seeding home_slides...');
            const defaultSlides = [
                { badge: "PROQUELEC SENEGAL", title: "Promotion de la Qualité des Installations Électriques", subtitle: "Sécurité · Qualité · Formation", description: "Expert en installations électriques au Sénégal depuis 1995.", background_url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=2000&auto=format&fit=crop", cta_text: "Nos Services", cta_link: "/#services", secondary_cta_text: "Contactez-nous", secondary_link: "/contact", order: 1 },
                { badge: "EXPERTISE 29 ANS", title: "L'Audit Électrique pour une Sécurité Totale", subtitle: "Contrôle · Diagnostic · Conformité", description: "Saviez-vous que 93% des installations au Sénégal ne sont pas conformes ?", background_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2000&auto=format&fit=crop", cta_text: "Demander un Audit", cta_link: "/contact", secondary_cta_text: "Nos Certifications", secondary_link: "/labels", order: 2 }
            ];
            for (const s of defaultSlides) {
                await pool.query(
                    'INSERT INTO public.home_slides (badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                    [s.badge, s.title, s.subtitle, s.description, s.background_url, s.cta_text, s.cta_link, s.secondary_cta_text, s.secondary_link, s.order]
                );
            }
        }

        const statsCheck = await pool.query('SELECT count(*) FROM public.home_stats');
        if (parseInt(statsCheck.rows[0].count) === 0) {
            await pool.query(`INSERT INTO public.home_stats(label, value, icon_name, description, is_warning, display_order) VALUES
        ('Années d''expérience', '29+', 'Award', 'Depuis 1995', false, 0),
        ('Professionnels formés', '1000+', 'Users', 'Électriciens certifiés', false, 1),
        ('Installations contrôlées', '500+', 'CheckCircle', 'Contrôles réalisés', false, 2),
        ('Conformité moyenne', '7%', 'AlertTriangle', 'À améliorer d''urgence', true, 3)`);
        }

        const servicesCheck = await pool.query('SELECT count(*) FROM public.home_services');
        if (parseInt(servicesCheck.rows[0].count) === 0) {
            await pool.query(`INSERT INTO public.home_services(title, description, icon_name, link, features, display_order) VALUES
    ('Formations Certifiantes', 'Habilitations électriques et formations aux normes NF C 15-100', 'BookOpen', '/events', ARRAY['Certificats reconnus', 'Formateurs experts', 'Programmes adaptés'], 0),
    ('Contrôles & Audits', 'Vérifications de conformité et diagnostics sécuritaires', 'Shield', '/activities', ARRAY['Normes en vigueur', 'Rapports détaillés', 'Recommandations'], 1),
    ('Efficacité Énergétique', 'Audits énergétiques et optimisation des installations', 'Zap', '/contact', ARRAY['Économies garanties', 'Solutions durables', 'ROI calculé'], 2)`);
        }

        console.log('Optimizing database performance (Proactive Indexing)...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
            CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
            CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
            CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);
        `);

        console.log('Verifying core system singletons...');
        await pool.query(`CREATE TABLE IF NOT EXISTS public.site_settings(
            id SERIAL PRIMARY KEY,
            site_name TEXT DEFAULT 'PROQUELEC SÉNÉGAL',
            slogan TEXT DEFAULT 'Sécurité · Qualité · Formation',
            logo_url TEXT, favicon_url TEXT, contact_email TEXT, phone_number TEXT, address TEXT,
            copyright_text TEXT, facebook_url TEXT, linkedin_url TEXT, twitter_url TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
        )`);
        const settingsCheck = await pool.query('SELECT COUNT(*) FROM public.site_settings WHERE id = 1');
        if (parseInt(settingsCheck.rows[0].count) === 0) {
            await pool.query("INSERT INTO public.site_settings (id, site_name) VALUES (1, 'PROQUELEC SÉNÉGAL')");
        }

        await pool.query(`CREATE TABLE IF NOT EXISTS public.theme_settings(
            id SERIAL PRIMARY KEY, primary_color TEXT DEFAULT '#2376df', secondary_color TEXT DEFAULT '#2C2C2C',
            accent_color TEXT DEFAULT '#ea580c', background_color TEXT DEFAULT '#ffffff',
            text_color TEXT DEFAULT '#1f2937', font_family TEXT DEFAULT 'Inter', updated_at TIMESTAMP DEFAULT NOW()
        )`);
        const themeCheck = await pool.query('SELECT COUNT(*) FROM public.theme_settings WHERE id = 1');
        if (parseInt(themeCheck.rows[0].count) === 0) {
            await pool.query("INSERT INTO public.theme_settings (id, primary_color, secondary_color) VALUES (1, '#2376df', '#2C2C2C')");
        }

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='phone_number') THEN
                    ALTER TABLE public.site_settings ADD COLUMN phone_number TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='facebook_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN facebook_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='linkedin_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN linkedin_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='twitter_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN twitter_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='copyright_text') THEN
                    ALTER TABLE public.site_settings ADD COLUMN copyright_text TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='require_email_confirmation') THEN
                    ALTER TABLE public.site_settings ADD COLUMN require_email_confirmation BOOLEAN DEFAULT false;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_height') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_height INTEGER DEFAULT 50;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_scale') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_scale DECIMAL DEFAULT 1.2;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_brightness') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_brightness INTEGER DEFAULT 100;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_contrast') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_contrast INTEGER DEFAULT 100;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='accent_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN accent_color TEXT DEFAULT '#ea580c';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='background_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN background_color TEXT DEFAULT '#ffffff';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='text_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN text_color TEXT DEFAULT '#1f2937';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='font_family') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN font_family TEXT DEFAULT 'Inter';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='footer_background_url') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN footer_background_url TEXT;
                END IF;
            END $$;
        `);

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@proquelec.com';
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (adminPassword) {
            const bcrypt = require('bcrypt');
            const userCheck = await pool.query('SELECT * FROM public.users WHERE email = $1', [adminEmail]);
            if (userCheck.rows.length === 0) {
                console.log('Seeding initial admin user...');
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                await pool.query(
                    'INSERT INTO public.users (email, password_hash, role, name) VALUES ($1, $2, $3, $4)',
                    [adminEmail, hashedPassword, 'admin', 'Administrateur']
                );
            }
        }

        console.log('[DB] Database system is fully operational and optimized.');
    } catch (err) {
        console.error('[DB] CRITICAL Database Initialization Error:', err);
    }
};

// Start
const { startSyncEngine } = require('./sync-engine');

initDB().then(() => {
    startSyncEngine(pool);
    app.listen(port, () => {
        console.log(`[SERVER] Server running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('[SERVER] CRITICAL: Database initialization failed:', err);
    app.listen(port, () => {
        console.log(`[SERVER] Server running on http://localhost:${port} (DEGRADED MODE - DB INIT FAILED)`);
    });
});
