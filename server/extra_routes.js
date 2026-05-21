
// -- Chat Endpoints --

// List User Chats
app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, created_at, updated_at FROM public.chats WHERE user_id = $1 ORDER BY updated_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create New Chat
app.post('/api/chats', authenticateToken, async (req, res) => {
    const { title, firstMessage } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create Chat
        const chatResult = await client.query(
            'INSERT INTO public.chats (user_id, title) VALUES ($1, $2) RETURNING *',
            [req.user.id, title || 'Nouveau chat']
        );
        const chatId = chatResult.rows[0].id;

        // 2. Add First Message if provided
        if (firstMessage) {
            await client.query(
                'INSERT INTO public.messages (chat_id, role, content, metadata) VALUES ($1, $2, $3, $4)',
                [chatId, firstMessage.role, firstMessage.content, firstMessage.metadata || {}]
            );
        }

        await client.query('COMMIT');
        res.json(chatResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Get Chat Details & Messages
app.get('/api/chats/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Verify ownership
        const chatCheck = await pool.query('SELECT id FROM public.chats WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (chatCheck.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });

        const messages = await pool.query(
            'SELECT * FROM public.messages WHERE chat_id = $1 ORDER BY created_at ASC',
            [id]
        );

        res.json({
            chat: chatCheck.rows[0],
            messages: messages.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Message to Chat
app.post('/api/chats/:id/messages', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { role, content, metadata } = req.body;

    try {
        // Verify ownership
        const chatCheck = await pool.query('SELECT id FROM public.chats WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (chatCheck.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });

        const result = await pool.query(
            'INSERT INTO public.messages (chat_id, role, content, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, role, content, metadata || {}]
        );

        // Update chat updated_at
        await pool.query('UPDATE public.chats SET updated_at = NOW() WHERE id = $1', [id]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rename Chat
app.put('/api/chats/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    try {
        const result = await pool.query(
            'UPDATE public.chats SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
            [title, id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Chat
app.delete('/api/chats/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM public.chats WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`PROQUELEC Server running on port ${PORT}`);
});
