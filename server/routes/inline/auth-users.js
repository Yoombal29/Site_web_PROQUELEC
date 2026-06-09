const { authenticateToken, requireAdmin } = require('../../core/middleware');

function mountAuthUsersRoutes(app, pool, deps) {
  const { bcrypt, jwt, JWT_SECRET, sendNewUserNotification } = deps;
  const ALLOWED_ROLES = ['electricien', 'entreprise', 'membre', 'partner'];

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    try {
      const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [normalizedEmail]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      if (user.is_active === false) {
        return res.status(403).json({
          error: 'Votre compte est en attente de validation par un administrateur.',
          code: 'ACCOUNT_PENDING',
        });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        access_token: token,
        user: { id: user.id, email: user.email, role: user.role, is_active: user.is_active },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, full_name, phone, company, role } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Type de profil invalide' });
    }
    try {
      const exists = await pool.query('SELECT id FROM public.users WHERE email = $1', [normalizedEmail]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'membre';
      let result;
      try {
        result = await pool.query(
          `INSERT INTO public.users (email, password_hash, role, is_active, full_name, phone, company, created_at)
           VALUES ($1, $2, $3, false, $4, $5, $6, NOW()) RETURNING id, email, role, is_active`,
          [normalizedEmail, hashedPassword, userRole, full_name || null, phone || null, company || null],
        );
      } catch (e) {
        result = await pool.query(
          `INSERT INTO public.users (email, password_hash, role, created_at)
           VALUES ($1, $2, $3, NOW()) RETURNING id, email, role, is_active`,
          [normalizedEmail, hashedPassword, userRole],
        );
      }
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      sendNewUserNotification({ email: user.email, nom: full_name, phone, role: userRole }).then(
        (r) => { if (r.success) console.log('[REGISTER] Email notification sent');
        else console.warn('[REGISTER] Email notification failed:', r.error); },
      );
      res.status(201).json({
        access_token: token,
        user: { id: user.id, email: user.email, role: user.role, is_active: user.is_active },
        message: 'Votre compte a été créé et est en attente de validation par un administrateur.',
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      console.log(`[AUTH-ME] Fetching user profile for ID: ${req.user.id}`);
      const result = await pool.query('SELECT id, email, role, is_active FROM public.users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) {
        console.warn(`[AUTH-ME] User not found for ID: ${req.user.id}`);
        return res.sendStatus(404);
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[AUTH-ME] CRITICAL ERROR:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });

  // Users list
  app.get('/api/users', authenticateToken, async (req, res) => {
    try {
      console.log('[API] Fetching all users...');
      const result = await pool.query('SELECT id, email, role, is_active as status, created_at FROM public.users ORDER BY created_at DESC');
      console.log(`[API] Found ${result.rows.length} users.`);
      res.json(result.rows);
    } catch (err) {
      console.error('[API-USERS] Error fetching users:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Admin users CRUD
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, email, role, is_active, created_at FROM public.users ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      console.error('[API-ADMIN-USERS] Error fetching admin users:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { email, password, role, is_active } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const normalizedEmail = String(email).trim().toLowerCase();
      const exists = await pool.query('SELECT id FROM public.users WHERE email = $1', [normalizedEmail]);
      if (exists.rows.length > 0) return res.status(409).json({ error: 'User already exists' });
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO public.users (email, password_hash, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, role, is_active, created_at`,
        [normalizedEmail, passwordHash, role || 'user', is_active === true],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('[API-ADMIN-USERS] Create error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const check = await pool.query('SELECT immutable FROM public.users WHERE id = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      if (check.rows[0].immutable) {
        const twoFactorCode = req.headers['x-2fa-code'];
        if (!twoFactorCode) {
          return res.status(403).json({ error: '2FA_REQUIRED', message: 'Code 2FA requis pour modifier ce compte protégé.' });
        }
        const valid = await pool.query('SELECT id FROM public.users WHERE id = $1 AND two_factor_secret = $2', [id, twoFactorCode]);
        if (valid.rows.length === 0) return res.status(403).json({ error: 'Code 2FA invalide.' });
      }
      const { email, role, password, is_active } = req.body;
      const updates = [];
      const params = [];
      let idx = 1;
      if (email) { updates.push(`email = $${idx++}`); params.push(String(email).trim().toLowerCase()); }
      if (role) { updates.push(`role = $${idx++}`); params.push(role); }
      if (typeof is_active !== 'undefined') { updates.push(`is_active = $${idx++}`); params.push(!!is_active); }
      if (password) { const hash = await bcrypt.hash(password, 10); updates.push(`password_hash = $${idx++}`); params.push(hash); }
      if (updates.length === 0) return res.status(400).json({ error: 'Aucune modification fournie' });
      params.push(id);
      const q = `UPDATE public.users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, role, is_active, created_at, immutable`;
      const result = await pool.query(q, params);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[API-ADMIN-USERS] Update error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const check = await pool.query('SELECT immutable FROM public.users WHERE id = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      if (check.rows[0].immutable) {
        return res.status(403).json({ error: 'IMMUTABLE_USER', message: 'Ce compte est protégé et ne peut pas être supprimé.' });
      }
      await pool.query('DELETE FROM public.users WHERE id = $1', [id]);
      res.sendStatus(204);
    } catch (err) {
      console.error('[API-ADMIN-USERS] Delete error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const check = await pool.query('SELECT immutable FROM public.users WHERE id = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      if (check.rows[0].immutable) {
        const twoFactorCode = req.headers['x-2fa-code'];
        if (!twoFactorCode) return res.status(403).json({ error: '2FA_REQUIRED', message: 'Code 2FA requis pour modifier ce compte protégé.' });
        const valid = await pool.query('SELECT id FROM public.users WHERE id = $1 AND two_factor_secret = $2', [id, twoFactorCode]);
        if (valid.rows.length === 0) return res.status(403).json({ error: 'Code 2FA invalide.' });
      }
      const { is_active } = req.body;
      if (typeof is_active === 'undefined') return res.status(400).json({ error: 'is_active required' });
      const result = await pool.query('UPDATE public.users SET is_active = $1 WHERE id = $2 RETURNING id, email, role, is_active, created_at, immutable', [!!is_active, id]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[API-ADMIN-USERS] Status error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/sub-admin', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { email, password, permissions } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
      const normalizedEmail = String(email).trim().toLowerCase();
      const exists = await pool.query('SELECT id FROM public.users WHERE email = $1', [normalizedEmail]);
      if (exists.rows.length > 0) return res.status(409).json({ error: 'Cet email existe déjà' });
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO public.users (email, password_hash, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING id, email, role, is_active, created_at',
        [normalizedEmail, passwordHash, 'secondary_admin'],
      );
      if (permissions && Array.isArray(permissions)) {
        for (const perm of permissions) {
          await pool.query(
            'INSERT INTO public.user_permissions (user_id, permission_id, granted) SELECT $1, id, true FROM public.permissions WHERE name = $2 ON CONFLICT DO NOTHING',
            [result.rows[0].id, perm],
          );
        }
      }
      res.status(201).json({ ...result.rows[0], permissions: permissions || [] });
    } catch (err) {
      console.error('[SUBADMIN] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/permissions-list', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name, description, category FROM public.permissions ORDER BY category, name');
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/admin/users/:id/permissions', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userResult = await pool.query('SELECT id, role FROM public.users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      const directResult = await pool.query(
        'SELECT p.name, up.granted FROM public.user_permissions up JOIN public.permissions p ON p.id = up.permission_id WHERE up.user_id = $1 ORDER BY p.name',
        [id],
      );
      const effectiveResult = await pool.query(
        `SELECT DISTINCT p.name FROM public.permissions p
         WHERE (EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role = $1 AND rp.permission_id = p.id)
            OR EXISTS (SELECT 1 FROM public.user_permissions up WHERE up.user_id = $2 AND up.permission_id = p.id AND up.granted = true))
           AND NOT EXISTS (SELECT 1 FROM public.user_permissions up WHERE up.user_id = $2 AND up.permission_id = p.id AND up.granted = false)
         ORDER BY p.name`,
        [userResult.rows[0].role, id],
      );
      res.json({
        permissions: effectiveResult.rows.map((row) => row.name),
        direct_permissions: directResult.rows.filter((row) => row.granted === true).map((row) => row.name),
        revoked_permissions: directResult.rows.filter((row) => row.granted === false).map((row) => row.name),
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put('/api/admin/users/:id/permissions', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : null;
      if (!permissions) return res.status(400).json({ error: 'permissions doit être un tableau' });
      const userResult = await client.query('SELECT id FROM public.users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      await client.query('DELETE FROM public.user_permissions WHERE user_id = $1', [id]);
      for (const perm of permissions) {
        await client.query(
          'INSERT INTO public.user_permissions (user_id, permission_id, granted) SELECT $1, id, true FROM public.permissions WHERE name = $2',
          [id, perm],
        );
      }
      res.json({ success: true, permissions });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { client.release(); }
  });
}

module.exports = { mountAuthUsersRoutes };
