const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Academy
 *   description: Gestion des cours et formations IA
 */

// GET /api/academy/courses - Liste tous les cours
router.get('/courses', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM academy_courses ORDER BY updated_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching academy courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/academy/courses/:id - Récupère un cours spécifique complet
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM academy_courses WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

        const course = result.rows[0];

        // Modules
        const modulesResult = await pool.query('SELECT * FROM academy_modules WHERE course_id = $1 ORDER BY order_index', [id]);
        course.modules = modulesResult.rows;

        // QCM
        const qcmResult = await pool.query('SELECT * FROM academy_qcm WHERE course_id = $1', [id]);
        course.qcm = qcmResult.rows;

        // Documents
        const docsResult = await pool.query('SELECT * FROM academy_documents WHERE course_id = $1', [id]);
        course.documents = docsResult.rows;

        res.json(course);
    } catch (error) {
        console.error('Error fetching academy course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/academy/courses - Crée un nouveau cours
router.post('/courses', authenticateToken, async (req, res) => {
    try {
        const { title, description, instructor_name, duration_hours, level, difficulty, status, content, modules, qcm } = req.body;

        // Transaction for safety
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const courseResult = await client.query(
                `INSERT INTO academy_courses (title, description, instructor_name, duration_hours, level, difficulty, status, content)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [title, description, instructor_name, duration_hours, level, difficulty, status || 'draft', JSON.stringify(content || {})]
            );

            const newCourse = courseResult.rows[0];

            // Inserer les modules si présents
            if (modules && Array.isArray(modules)) {
                for (let i = 0; i < modules.length; i++) {
                    const mod = modules[i];
                    await client.query(
                        `INSERT INTO academy_modules (course_id, title, order_index, prerequisites, knowledge, skills, duration_minutes)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [newCourse.id, mod.title, i, JSON.stringify(mod.prerequisites || []), JSON.stringify(mod.knowledge || []), JSON.stringify(mod.skills || []), mod.duration]
                    );
                }
            }

            // Inserer les QCM si présents
            if (qcm && Array.isArray(qcm)) {
                for (const quiz of qcm) {
                    await client.query(
                        `INSERT INTO academy_qcm (course_id, title, questions)
                         VALUES ($1, $2, $3)`,
                        [newCourse.id, quiz.title || 'Quiz', JSON.stringify(quiz.questions || quiz)]
                    );
                }
            }

            await client.query('COMMIT');
            res.status(201).json(newCourse);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating academy course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/academy/courses/:id
router.delete('/courses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM academy_courses WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting academy course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
