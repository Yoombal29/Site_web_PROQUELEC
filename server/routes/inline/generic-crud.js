const { authenticateToken } = require('../../core/middleware');

function mountGenericCrudRoutes(app, pool) {
  async function getTable(req, res, tableName, orderBy = 'id') {
    try {
      const columnsRes = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`, [tableName]);
      const columns = columnsRes.rows.map(r => ({ name: r.column_name, type: r.data_type }));
      const dataRes = await pool.query(`SELECT * FROM public.${tableName} ORDER BY ${orderBy}`);
      res.json({ columns, rows: dataRes.rows });
    } catch (err) { console.error(`[GENERIC-CRUD] Error fetching ${tableName}:`, err); res.status(500).json({ error: err.message }); }
  }

  async function executeQuery(res, query, params = []) {
    try {
      const result = await pool.query(query, params);
      const multiResults = result.filter ? result : [result];
      res.json({ multiple: multiResults.length > 1, results: multiResults.map(r => ({ rows: r.rows, rowCount: r.rowCount, command: r.command })) });
    } catch (err) { console.error('[GENERIC-CRUD] Query error:', err); res.status(500).json({ error: err.message }); }
  }

  // -- Electrical Certifications --
  app.get('/api/electrical-certifications', async (req, res) => { await getTable(req, res, 'electrical_certifications', 'name ASC'); });

  app.post('/api/electrical-certifications', authenticateToken, async (req, res) => {
    const { name, code, description, validity_period, required_training_hours, certification_body, cost, requirements, is_active } = req.body;
    await executeQuery(res, 'INSERT INTO public.electrical_certifications (name, code, description, validity_period, required_training_hours, certification_body, cost, requirements, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *', [name, code, description, validity_period, required_training_hours, certification_body, cost, requirements, is_active !== false]);
  });

  app.put('/api/electrical-certifications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, code, description, validity_period, required_training_hours, certification_body, cost, requirements, is_active } = req.body;
    await executeQuery(res, 'UPDATE public.electrical_certifications SET name=$1, code=$2, description=$3, validity_period=$4, required_training_hours=$5, certification_body=$6, cost=$7, requirements=$8, is_active=$9, updated_at=NOW() WHERE id=$10 RETURNING *', [name, code, description, validity_period, required_training_hours, certification_body, cost, requirements, is_active, id]);
  });

  app.delete('/api/electrical-certifications/:id', authenticateToken, async (req, res) => {
    await executeQuery(res, 'DELETE FROM public.electrical_certifications WHERE id=$1', [req.params.id]);
  });

  // -- Download Buttons (Configurable CTA Buttons) --
  app.get('/api/download-buttons', async (req, res) => { await getTable(req, res, 'download_buttons', 'created_at DESC'); });

  app.post('/api/download-buttons', authenticateToken, async (req, res) => {
    const { title, bucket, path, icon, color, visible } = req.body;
    await executeQuery(res, 'INSERT INTO public.download_buttons (title, bucket, path, icon, color, visible, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *', [title, bucket, path, icon, color, visible !== false]);
  });

  app.put('/api/download-buttons/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, bucket, path, icon, color, visible } = req.body;
    await executeQuery(res, 'UPDATE public.download_buttons SET title=$1, bucket=$2, path=$3, icon=$4, color=$5, visible=$6, updated_at=NOW() WHERE id=$7 RETURNING *', [title, bucket, path, icon, color, visible, id]);
  });

  app.delete('/api/download-buttons/:id', authenticateToken, async (req, res) => {
    await executeQuery(res, 'DELETE FROM public.download_buttons WHERE id=$1', [req.params.id]);
  });

  // -- Normative Articles (Search) --
  app.get('/api/normative-articles', async (req, res) => {
    try {
      const { query } = req.query;
      let result;
      if (query) {
        result = await pool.query('SELECT * FROM public.electrical_standards WHERE title ILIKE $1 OR description ILIKE $1 OR code ILIKE $1 OR summary ILIKE $1 ORDER BY code ASC LIMIT 50', [`%${query}%`]);
      } else {
        result = await pool.query('SELECT * FROM public.electrical_standards ORDER BY code ASC LIMIT 50');
      }
      res.json(result.rows);
    } catch (err) { console.error('Error fetching normative articles:', err); res.status(500).json({ error: err.message }); }
  });
}

module.exports = { mountGenericCrudRoutes };
