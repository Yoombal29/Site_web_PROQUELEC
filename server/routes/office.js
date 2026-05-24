const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Office
 *   description: Gestion des documents Office (Text, Spreadsheet, Presentation)
 */

/**
 * @swagger
 * /api/office/documents:
 *   get:
 *     summary: Liste tous les documents Office
 *     tags: [Office]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [document, spreadsheet, presentation]
 *         description: Filtrer par type de document
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des documents récupérée
 *       500:
 *         description: Erreur serveur
 */
// GET /api/office/documents - Liste tous les documents Office
router.get('/documents', authenticateToken, async (req, res) => {
    try {
        const { type, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT 
        od.*,
        u.email as created_by_name,
        COUNT(odv.id) as version_count
      FROM office_documents od
      LEFT JOIN users u ON od.created_by = u.id
      LEFT JOIN office_document_versions odv ON od.id = odv.document_id
    `;

        const params = [];
        const conditions = [];

        if (type) {
            conditions.push(`od.type = $${params.length + 1}`);
            params.push(type);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += `
      GROUP BY od.id, u.email
      ORDER BY od.updated_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching office documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/office/documents/{id}:
 *   get:
 *     summary: Récupère un document spécifique
 *     tags: [Office]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document récupéré
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur serveur
 */
// GET /api/office/documents/:id - Récupère un document spécifique
router.get('/documents/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT 
        od.*,
        u.email as created_by_name
      FROM office_documents od
      LEFT JOIN users u ON od.created_by = u.id
      WHERE od.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/office/documents:
 *   post:
 *     summary: Crée un nouveau document
 *     tags: [Office]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, content]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [document, spreadsheet, presentation]
 *               title:
 *                 type: string
 *               content:
 *                 type: object
 *               metadata:
 *                 type: object
 *               template_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Document créé
 *       400:
 *         description: Champs manquants ou type invalide
 *       500:
 *         description: Erreur serveur
 */
// POST /api/office/documents - Crée un nouveau document
router.post('/documents', authenticateToken, async (req, res) => {
    try {
        const { type, title, content, metadata, template_id } = req.body;
        const userId = req.user.id;

        if (!type || !title || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['document', 'spreadsheet', 'presentation'].includes(type)) {
            return res.status(400).json({ error: 'Invalid document type' });
        }

        const result = await pool.query(`
      INSERT INTO office_documents (type, title, content, metadata, template_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [type, title, JSON.stringify(content), JSON.stringify(metadata || {}), template_id, userId]);

        // Créer la première version
        await pool.query(`
      INSERT INTO office_document_versions (document_id, version_number, content, created_by)
      VALUES ($1, 1, $2, $3)
    `, [result.rows[0].id, JSON.stringify(content), userId]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const crypto = require('crypto');

function hashContent(content) {
    return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

/**
 * @swagger
 * /api/office/documents/{id}:
 *   put:
 *     summary: Met à jour un document
 *     tags: [Office]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: object
 *               metadata:
 *                 type: object
 *               force:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Document mis à jour
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur serveur
 */
// PUT /api/office/documents/:id - Met à jour un document
router.put('/documents/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, metadata, force } = req.body;
        const userId = req.user.id;

        // 1. Vérifier que le document existe
        const existingResult = await pool.query('SELECT * FROM office_documents WHERE id = $1', [id]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const existingDoc = existingResult.rows[0];

        // 2. Gestion de Conflit (Basique pour Phase 1)
        // Si on voulait être strict : if (updated_at_local < existingDoc.updated_at && !force) ...
        // Pour l'instant on accepte l'écrasement en mode SOLO, mais on prépare le terrain.

        // 3. Mettre à jour le document "Courant"
        const updateResult = await pool.query(`
      UPDATE office_documents
      SET 
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        metadata = COALESCE($3, metadata),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [
            title,
            content ? JSON.stringify(content) : null,
            metadata ? JSON.stringify(metadata) : null,
            id
        ]);

        const updatedDoc = updateResult.rows[0];

        // 4. Smart Versioning : Créer une version SANS SPAM
        if (content) {
            const currentHash = hashContent(content);

            // Récupérer la dernière version
            const lastVersionResult = await pool.query(
                `SELECT content_hash, version_number 
                 FROM office_document_versions 
                 WHERE document_id = $1 
                 ORDER BY version_number DESC 
                 LIMIT 1`,
                [id]
            );

            let shouldCreateVersion = false;
            let nextVersion = 1;

            if (lastVersionResult.rows.length === 0) {
                shouldCreateVersion = true; // Première version
            } else {
                const lastVersion = lastVersionResult.rows[0];
                nextVersion = lastVersion.version_number + 1;

                // Comparer les hashs
                if (lastVersion.content_hash !== currentHash) {
                    shouldCreateVersion = true;
                } else {
                    // console.log('Skipping version creation: content unchanged');
                }
            }

            if (shouldCreateVersion) {
                await pool.query(`
            INSERT INTO office_document_versions (document_id, version_number, content, content_hash, created_by)
            VALUES ($1, $2, $3, $4, $5)
          `, [id, nextVersion, JSON.stringify(content), currentHash, userId]);
            }
        }

        res.json(updatedDoc);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/office/documents/{id}:
 *   delete:
 *     summary: Supprime un document
 *     tags: [Office]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document supprimé
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur serveur
 */
// DELETE /api/office/documents/:id - Supprime un document
router.delete('/documents/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM office_documents WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({ message: 'Document deleted successfully', id: result.rows[0].id });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/office/documents/{id}/versions:
 *   get:
 *     summary: Récupère l'historique des versions d'un document
 *     tags: [Office]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historique des versions récupéré
 *       500:
 *         description: Erreur serveur
 */
// GET /api/office/documents/:id/versions - Récupère l'historique des versions
router.get('/documents/:id/versions', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT 
        odv.*,
        u.email as created_by_name
      FROM office_document_versions odv
      LEFT JOIN users u ON odv.created_by = u.id
      WHERE odv.document_id = $1
      ORDER BY odv.version_number DESC
    `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching versions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/office/documents/{id}/export:
 *   post:
 *     summary: Exporte un document vers la GED
 *     tags: [Office]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [format]
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [pdf, docx, xlsx, pptx]
 *     responses:
 *       200:
 *         description: Export lancé
 *       500:
 *         description: Erreur serveur
 */
// POST /api/office/documents/:id/export - Exporte vers la GED
router.post('/documents/:id/export', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { format } = req.body; // 'pdf', 'docx', 'xlsx', 'pptx'

        if (!['pdf', 'docx', 'xlsx', 'pptx'].includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Use: pdf, docx, xlsx, pptx' });
        }

        // Récupérer le document
        const docResult = await pool.query('SELECT * FROM office_documents WHERE id = $1', [id]);
        if (docResult.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const doc = docResult.rows[0];
        const content = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;

        let buffer;
        let filename = `${doc.title || 'document'}.${format}`;
        let contentType;

        // Format conversion logic
        if (format === 'pdf') {
            const { jsPDF } = require('jspdf');
            const pdfDoc = new jsPDF();
            
            // Add title
            pdfDoc.setFontSize(16);
            pdfDoc.text(doc.title || 'Document', 10, 10);
            
            // Add content
            pdfDoc.setFontSize(11);
            let yPosition = 30;
            const pageHeight = pdfDoc.internal.pageSize.height;
            const maxWidth = 180;
            
            const contentText = extractTextFromContent(content);
            const lines = pdfDoc.splitTextToSize(contentText, maxWidth);
            
            lines.forEach((line) => {
                if (yPosition > pageHeight - 10) {
                    pdfDoc.addPage();
                    yPosition = 10;
                }
                pdfDoc.text(line, 10, yPosition);
                yPosition += 7;
            });
            
            // Metadata
            pdfDoc.setProperties({
                title: doc.title,
                author: 'PROQUELEC',
                subject: 'Document Export',
                creator: 'PROQUELEC Office Suite'
            });
            
            buffer = Buffer.from(pdfDoc.output('arraybuffer'));
            contentType = 'application/pdf';
            filename = `${doc.title || 'document'}.pdf`;
        }
        else if (format === 'docx') {
            const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');
            
            const sections = [];
            
            // Title
            sections.push(new Paragraph({
                text: doc.title || 'Document',
                heading: HeadingLevel.HEADING_1,
                thematicBreak: false
            }));
            
            // Content paragraphs
            const contentText = extractTextFromContent(content);
            contentText.split('\n').forEach(line => {
                if (line.trim()) {
                    sections.push(new Paragraph({
                        text: line,
                        spacing: { line: 240, after: 100 }
                    }));
                }
            });
            
            const docxDoc = new Document({
                sections: [{
                    children: sections
                }],
                creator: 'PROQUELEC',
                title: doc.title
            });
            
            const docBuffer = await Packer.toBuffer(docxDoc);
            buffer = docBuffer;
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            filename = `${doc.title || 'document'}.docx`;
        }
        else if (format === 'xlsx') {
            const XLSX = require('xlsx');
            
            let data = [];
            if (doc.type === 'spreadsheet' && content && content.sheets) {
                // Spreadsheet document
                data = content.sheets[0]?.data || [[doc.title], ['No data']];
            } else {
                // Default: text document as single row
                data = [
                    ['Title', doc.title],
                    ['Content', extractTextFromContent(content).substring(0, 500)]
                ];
            }
            
            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
            buffer = excelBuffer;
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            filename = `${doc.title || 'document'}.xlsx`;
        }
        else if (format === 'pptx') {
            const PptxGenJS = require('pptxgenjs');
            const prs = new PptxGenJS();
            
            // Slide 1: Title
            const slide1 = prs.addSlide();
            slide1.addText(doc.title || 'Document', {
                x: 0.5, y: 2, w: 9, h: 1.5,
                fontSize: 44, bold: true, color: '003366'
            });
            
            slide1.addText('PROQUELEC', {
                x: 0.5, y: 3.8, w: 9, h: 0.5,
                fontSize: 18, color: '666666'
            });
            
            // Slide 2: Content
            const slide2 = prs.addSlide();
            slide2.addText(doc.title || 'Document', {
                x: 0.5, y: 0.5, w: 9, h: 0.75,
                fontSize: 32, bold: true, color: '003366'
            });
            
            const contentText = extractTextFromContent(content).substring(0, 1000);
            slide2.addText(contentText, {
                x: 0.5, y: 1.5, w: 9, h: 4.5,
                fontSize: 14, color: '333333'
            });
            
            const pptxBuffer = await prs.writeFile({ fileName: filename });
            buffer = await require('fs').promises.readFile(pptxBuffer);
            contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            filename = `${doc.title || 'document'}.pptx`;
        }

        // Send file
        res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.set('Content-Type', contentType);
        res.send(buffer);

        // Log export
        console.log(`[OFFICE] Exported document ${id} as ${format}`);

    } catch (error) {
        console.error('Error exporting document:', error);
        res.status(500).json({ error: 'Export failed: ' + error.message });
    }
});

// Helper function to extract text from various content formats
function extractTextFromContent(content) {
    if (typeof content === 'string') {
        return content;
    }
    if (!content) return '';
    
    // HTML to text
    if (content.html) {
        return content.html.replace(/<[^>]*>/g, '').trim();
    }
    
    // JSON to text
    if (content.blocks && Array.isArray(content.blocks)) {
        return content.blocks.map(b => b.data?.text || '').join('\n');
    }
    
    // Tiptap/ProseMirror format
    if (content.type === 'doc' && content.content) {
        return content.content.map(node => {
            if (node.content) {
                return node.content.map(n => n.text || '').join('');
            }
            return node.text || '';
        }).join('\n');
    }
    
    // Fallback
    return JSON.stringify(content, null, 2).substring(0, 500);
}

module.exports = router;
