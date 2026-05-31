const pool = require('../../core/database');

async function getChats(userId) {
    const result = await pool.query('SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
}

async function createChat(userId, title) {
    const result = await pool.query(
        'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *',
        [userId, title || 'Nouvelle conversation']
    );
    return result.rows[0];
}

async function deleteChat(chatId, userId) {
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [chatId, userId]);
    if (check.rowCount === 0) return false;
    await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);
    return true;
}

async function updateChat(chatId, userId, title) {
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [chatId, userId]);
    if (check.rowCount === 0) return null;
    const result = await pool.query('UPDATE chats SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [title, chatId]);
    return result.rows[0];
}

async function getMessages(chatId, userId) {
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [chatId, userId]);
    if (check.rowCount === 0) return null;
    const result = await pool.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC', [chatId]);
    return result.rows;
}

async function createMessage(chatId, userId, { role, content, metadata }) {
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [chatId, userId]);
    if (check.rowCount === 0) return null;
    const result = await pool.query(
        'INSERT INTO messages (chat_id, role, content, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, role, content, metadata || {}]
    );
    return result.rows[0];
}

async function getAiLogs() {
    const result = await pool.query('SELECT * FROM public.ai_requests_log ORDER BY created_at DESC LIMIT 50');
    return result.rows;
}

module.exports = {
    getChats,
    createChat,
    deleteChat,
    updateChat,
    getMessages,
    createMessage,
    getAiLogs
};
