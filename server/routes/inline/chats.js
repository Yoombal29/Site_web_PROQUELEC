const { authenticateToken } = require('../../core/middleware');

function mountChatRoutes(app, pool) {
  app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
      console.log(`[CHAT-API] Fetching chats for user: ${req.user.id}`);
      const result = await pool.query('SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
      console.log(`[CHAT-API] Found ${result.rows.length} chats.`);
      res.json(result.rows);
    } catch (err) {
      console.error('[CHAT-API-ERROR] Failed to fetch chats:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/chats', authenticateToken, async (req, res) => {
    try {
      console.log(`[CHAT-API] Creating new chat for user: ${req.user.id}`);
      const result = await pool.query('INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *', [req.user.id, req.body.title || 'Nouvelle conversation']);
      console.log(`[CHAT-API] Created chat with ID: ${result.rows[0].id}`);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[CHAT-API-ERROR] Failed to create chat:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/chats/:sessionId', authenticateToken, async (req, res) => {
    try {
      const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [req.params.sessionId, req.user.id]);
      if (check.rowCount === 0) return res.status(403).send('Unauthorized');
      await pool.query('DELETE FROM chats WHERE id = $1', [req.params.sessionId]);
      res.sendStatus(204);
    } catch (err) {
      console.error('[CHAT-API-ERROR] Failed to delete chat:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/chats/:sessionId', authenticateToken, async (req, res) => {
    try {
      const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [req.params.sessionId, req.user.id]);
      if (check.rowCount === 0) return res.status(403).send('Unauthorized');
      const { title } = req.body;
      const result = await pool.query('UPDATE chats SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [title, req.params.sessionId]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('[CHAT-API-ERROR] Failed to update chat:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/chats/:sessionId/messages', authenticateToken, async (req, res) => {
    try {
      console.log(`[CHAT-API] Fetching messages for session: ${req.params.sessionId} (user: ${req.user.id})`);
      const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [req.params.sessionId, req.user.id]);
      if (check.rowCount === 0) return res.status(404).json({ error: 'Session non trouvée' });
      const result = await pool.query('SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC', [req.params.sessionId]);
      res.json(result.rows);
    } catch (err) {
      console.error('[CHAT-API-ERROR] Failed to fetch messages:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/chats/:sessionId/messages', authenticateToken, async (req, res) => {
    try {
      console.log(`[CHAT-API] Adding message to session: ${req.params.sessionId} (user: ${req.user.id})`);
      const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [req.params.sessionId, req.user.id]);
      if (check.rowCount === 0) return res.status(404).json({ error: 'Session non trouvée' });
      const { role, content } = req.body;
      const result = await pool.query('INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *', [req.params.sessionId, role || 'user', content]);
      await pool.query('UPDATE chats SET updated_at = NOW() WHERE id = $1', [req.params.sessionId]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('[CHAT-API-ERROR] Failed to add message:', err);
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { mountChatRoutes };
