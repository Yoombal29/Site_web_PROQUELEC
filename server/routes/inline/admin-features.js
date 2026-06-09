const { authenticateToken, requireAdmin } = require('../../core/middleware');

function mountAdminFeaturesRoutes(app, pool) {
  // ============================================================
  // SITE SETTINGS
  // ============================================================
  app.get('/api/admin/site-settings', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.site_settings WHERE id = 1');
      if (result.rows.length === 0) return res.json({});
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/admin/site-settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { site_name, slogan, logo_url, favicon_url, contact_email, phone_number, address, copyright_text, facebook_url, linkedin_url, twitter_url, logo_height, logo_scale, logo_brightness, logo_contrast, cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url } = req.body;
      const result = await pool.query(
        `INSERT INTO public.site_settings (id, site_name, slogan, logo_url, favicon_url, contact_email, phone_number, address, copyright_text, facebook_url, linkedin_url, twitter_url, logo_height, logo_scale, logo_brightness, logo_contrast, cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
         ON CONFLICT (id) DO UPDATE SET site_name=$1, slogan=$2, logo_url=$3, favicon_url=$4, contact_email=$5, phone_number=$6, address=$7, copyright_text=$8, facebook_url=$9, linkedin_url=$10, twitter_url=$11, logo_height=$12, logo_scale=$13, logo_brightness=$14, logo_contrast=$15, cta_primary_text=$16, cta_primary_url=$17, cta_secondary_text=$18, cta_secondary_url=$19, updated_at=NOW()
         RETURNING *`,
        [site_name, slogan, logo_url, favicon_url, contact_email, phone_number, address, copyright_text, facebook_url, linkedin_url, twitter_url, logo_height, logo_scale, logo_brightness, logo_contrast, cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url]
      );
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============================================================
  // THEME SETTINGS
  // ============================================================
  app.get('/api/admin/theme-settings', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.theme_settings WHERE id = 1');
      if (result.rows.length === 0) return res.json({});
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/admin/theme-settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { primary_color, secondary_color, accent_color, background_color, text_color, font_family, footer_background_url } = req.body;
      const result = await pool.query(
        `INSERT INTO public.theme_settings (id, primary_color, secondary_color, accent_color, background_color, text_color, font_family, footer_background_url)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET primary_color=$1, secondary_color=$2, accent_color=$3, background_color=$4, text_color=$5, font_family=$6, footer_background_url=$7
         RETURNING *`,
        [primary_color, secondary_color, accent_color, background_color, text_color, font_family, footer_background_url]
      );
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============================================================
  // HOMEPAGE HERO
  // ============================================================
  app.get('/api/hero', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.home_hero WHERE id = 1');
      res.json(result.rows[0] || {});
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/hero', authenticateToken, async (req, res) => {
    try {
      const { title, subtitle, description, cta_text, cta_link, background_url } = req.body;
      const result = await pool.query(
        'INSERT INTO public.home_hero (id, title, subtitle, description, cta_text, cta_link, background_url) VALUES (1, $1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET title=$1, subtitle=$2, description=$3, cta_text=$4, cta_link=$5, background_url=$6 RETURNING *',
        [title, subtitle, description, cta_text, cta_link, background_url]
      );
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ============================================================
  // HOMEPAGE SLIDES
  // ============================================================
  app.get('/api/home-slides', async (req, res) => {
    const result = await pool.query('SELECT * FROM public.home_slides ORDER BY display_order ASC');
    res.json(result.rows);
  });

  app.post('/api/home-slides', authenticateToken, async (req, res) => {
    const { badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO public.home_slides (badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order]
    );
    res.status(201).json(result.rows[0]);
  });

  app.put('/api/home-slides/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order } = req.body;
    const result = await pool.query(
      'UPDATE public.home_slides SET badge=$1, title=$2, subtitle=$3, description=$4, background_url=$5, cta_text=$6, cta_link=$7, secondary_cta_text=$8, secondary_cta_link=$9, display_order=$10 WHERE id=$11 RETURNING *',
      [badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order, id]
    );
    res.json(result.rows[0]);
  });

  app.delete('/api/home-slides/:id', authenticateToken, async (req, res) => {
    await pool.query('DELETE FROM public.home_slides WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  });

  // ============================================================
  // SERVICES
  // ============================================================
  app.get('/api/services', async (req, res) => {
    const result = await pool.query('SELECT * FROM public.home_services ORDER BY display_order ASC');
    res.json(result.rows);
  });

  app.post('/api/services', authenticateToken, async (req, res) => {
    const { title, subtitle, description, cta_text, cta_link, background_url } = req.body;
    const result = await pool.query(
      'INSERT INTO public.home_services (title, subtitle, description, cta_text, cta_link, background_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, subtitle, description, cta_text, cta_link, background_url]
    );
    res.status(201).json(result.rows[0]);
  });

  app.put('/api/services/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, description, cta_text, cta_link, background_url } = req.body;
    const result = await pool.query(
      'UPDATE public.home_services SET title=$1, subtitle=$2, description=$3, cta_text=$4, cta_link=$5, background_url=$6 WHERE id=$7 RETURNING *',
      [title, subtitle, description, cta_text, cta_link, background_url, id]
    );
    res.json(result.rows[0]);
  });

  app.delete('/api/services/:id', authenticateToken, async (req, res) => {
    await pool.query('DELETE FROM public.home_services WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  });

  // ============================================================
  // STATS
  // ============================================================
  app.get('/api/stats', async (req, res) => {
    const result = await pool.query('SELECT * FROM public.home_stats ORDER BY display_order ASC');
    res.json(result.rows);
  });

  app.post('/api/stats', authenticateToken, async (req, res) => {
    const { label, value, icon_name, description, is_warning, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO public.home_stats (label, value, icon_name, description, is_warning, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [label, value, icon_name, description, is_warning, display_order]
    );
    res.status(201).json(result.rows[0]);
  });

  app.put('/api/stats/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { label, value, icon_name, description, is_warning, display_order } = req.body;
    const result = await pool.query(
      'UPDATE public.home_stats SET label=$1, value=$2, icon_name=$3, description=$4, is_warning=$5, display_order=$6 WHERE id=$7 RETURNING *',
      [label, value, icon_name, description, is_warning, display_order, id]
    );
    res.json(result.rows[0]);
  });

  app.delete('/api/stats/:id', authenticateToken, async (req, res) => {
    await pool.query('DELETE FROM public.home_stats WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  });

  // ============================================================
  // PARTNERS
  // ============================================================
  app.get('/api/partners', async (req, res) => {
    const result = await pool.query('SELECT * FROM public.partners ORDER BY display_order ASC');
    res.json(result.rows);
  });

  app.post('/api/partners', authenticateToken, async (req, res) => {
    const { name, logo_url, category, display_order, is_active } = req.body;
    const result = await pool.query(
      'INSERT INTO public.partners (name, logo_url, category, display_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, logo_url, category, display_order, is_active]
    );
    res.status(201).json(result.rows[0]);
  });

  app.put('/api/partners/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, logo_url, category, display_order, is_active } = req.body;
    const result = await pool.query(
      'UPDATE public.partners SET name=$1, logo_url=$2, category=$3, display_order=$4, is_active=$5 WHERE id=$6 RETURNING *',
      [name, logo_url, category, display_order, is_active, id]
    );
    res.json(result.rows[0]);
  });

  app.delete('/api/partners/:id', authenticateToken, async (req, res) => {
    await pool.query('DELETE FROM public.partners WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  });

  // ============================================================
  // TOOLS & OFFERS
  // ============================================================
  app.get('/api/tools', async (req, res) => {
    const result = await pool.query('SELECT * FROM public.quick_links ORDER BY display_order ASC');
    res.json(result.rows);
  });

  app.post('/api/tools', authenticateToken, async (req, res) => {
    const { title, description, url, icon_name, display_order, is_active } = req.body;
    const result = await pool.query(
      'INSERT INTO public.quick_links (title, description, url, icon_name, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, url, icon_name, display_order, is_active]
    );
    res.status(201).json(result.rows[0]);
  });

  app.put('/api/tools/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, url, icon_name, display_order, is_active } = req.body;
    const result = await pool.query(
      'UPDATE public.quick_links SET title=$1, description=$2, url=$3, icon_name=$4, display_order=$5, is_active=$6 WHERE id=$7 RETURNING *',
      [title, description, url, icon_name, display_order, is_active, id]
    );
    res.json(result.rows[0]);
  });

  app.delete('/api/tools/:id', authenticateToken, async (req, res) => {
    await pool.query('DELETE FROM public.quick_links WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  });

  // ============================================================
  // TESTIMONIALS
  // ============================================================
  app.get('/api/testimonials', async (req, res) => {
    const result = await pool.query('SELECT * FROM public.testimonials ORDER BY created_at DESC');
    res.json(result.rows);
  });

  app.post('/api/testimonials', authenticateToken, async (req, res) => {
    const { name, role, content, rating, avatar_url } = req.body;
    const result = await pool.query(
      'INSERT INTO public.testimonials (name, role, content, rating, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, role, content, rating, avatar_url]
    );
    res.status(201).json(result.rows[0]);
  });

  app.put('/api/testimonials/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, role, content, rating, avatar_url } = req.body;
    const result = await pool.query(
      'UPDATE public.testimonials SET name=$1, role=$2, content=$3, rating=$4, avatar_url=$5 WHERE id=$6 RETURNING *',
      [name, role, content, rating, avatar_url, id]
    );
    res.json(result.rows[0]);
  });

  app.delete('/api/testimonials/:id', authenticateToken, async (req, res) => {
    await pool.query('DELETE FROM public.testimonials WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  });

  // ============================================================
  // QUICK LINKS
  // ============================================================
  app.get('/api/quick-links', async (req, res) => {
    const result = await pool.query('SELECT * FROM public.quick_links ORDER BY display_order ASC');
    res.json(result.rows);
  });

  // ============================================================
  // SUBSCRIPTION PLANS
  // ============================================================
  app.get('/api/subscription-plans', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.subscription_plans WHERE is_active = true ORDER BY price');
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/subscriptions', authenticateToken, async (req, res) => {
    try {
      const { plan_id } = req.body;
      if (!plan_id) return res.status(400).json({ error: 'Plan requis' });
      const plan = await pool.query('SELECT * FROM public.subscription_plans WHERE id = $1 AND is_active = true', [plan_id]);
      if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan non trouvé' });
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.rows[0].duration_days);
      const result = await pool.query(
        'INSERT INTO public.user_subscriptions (user_id, plan_id, start_date, end_date, is_active, created_at) VALUES ($1, $2, NOW(), $3, true, NOW()) ON CONFLICT (user_id) DO UPDATE SET plan_id=$2, start_date=NOW(), end_date=$3, is_active=true, updated_at=NOW() RETURNING *',
        [req.user.id, plan_id, endDate]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/my-subscription', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT us.*, sp.name, sp.description, sp.features, sp.price FROM public.user_subscriptions us JOIN public.subscription_plans sp ON us.plan_id = sp.id WHERE us.user_id = $1 AND us.is_active = true AND us.end_date > NOW() ORDER BY us.end_date DESC LIMIT 1',
        [req.user.id]
      );
      res.json(result.rows[0] || null);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/admin/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT us.*, sp.name as plan_name, u.email as user_email FROM public.user_subscriptions us JOIN public.subscription_plans sp ON us.plan_id = sp.id JOIN public.users u ON us.user_id = u.id ORDER BY us.created_at DESC'
      );
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/admin/subscriptions/manual-activate', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { user_id, plan_id, duration_days, notes } = req.body;
      if (!user_id || !plan_id) return res.status(400).json({ error: 'user_id et plan_id requis' });
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (duration_days || 30));
      const result = await pool.query(
        'INSERT INTO public.user_subscriptions (user_id, plan_id, start_date, end_date, is_active, created_at, notes) VALUES ($1, $2, NOW(), $3, true, NOW(), $4) ON CONFLICT (user_id) DO UPDATE SET plan_id=$2, start_date=NOW(), end_date=$3, is_active=true, updated_at=NOW(), notes=$4 RETURNING *',
        [user_id, plan_id, endDate, notes || null]
      );
      res.status(201).json({ success: true, subscription: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
}

module.exports = { mountAdminFeaturesRoutes };
