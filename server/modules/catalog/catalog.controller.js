const service = require('./catalog.service');

function makeCrudController(table, columns, orderBy) {
    const svcGetAll = service.getAll(table, orderBy);
    const svcGetById = service.getById(table);
    const svcCreate = service.create(table, columns);
    const svcUpdate = service.update(table, columns);
    const svcRemove = service.remove(table);

    return {
        list: async (req, res) => {
            try {
                const items = await svcGetAll();
                res.json(items);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        },
        get: async (req, res) => {
            try {
                const item = await svcGetById(req.params.id);
                if (!item) return res.status(404).json({ error: 'Not found' });
                res.json(item);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        },
        create: async (req, res) => {
            try {
                const item = await svcCreate(req.body);
                res.status(201).json(item);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        },
        update: async (req, res) => {
            try {
                const item = await svcUpdate(req.params.id, req.body);
                res.json(item);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        },
        remove: async (req, res) => {
            try {
                await svcRemove(req.params.id);
                res.json({ success: true });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        },
    };
}

const stdColumns = ['title', 'code', 'category', 'description', 'version', 'status', 'document_url', 'summary'];
const eqColumns = ['name', 'brand', 'model', 'category', 'description', 'price', 'stock_quantity', 'image_url'];
const trainingColumns = ['title', 'description', 'duration_hours', 'level', 'price', 'max_participants', 'instructor_name', 'location', 'equipment_provided', 'prerequisites', 'learning_objectives'];
const certColumns = ['certificate_number', 'holder_name', 'type', 'expiry_date', 'status', 'metadata'];
const auditColumns = ['site_name', 'location', 'inspector_id', 'findings', 'compliance_score', 'recommendations'];
const networkColumns = ['name', 'specializations', 'region', 'phone', 'email', 'projects_count'];
const elecCertColumns = ['name', 'code', 'description', 'validity_period', 'required_training_hours', 'certification_body', 'cost', 'requirements', 'is_active'];
const downloadBtnColumns = ['title', 'bucket', 'path', 'icon', 'color', 'visible'];

const standards = makeCrudController('electrical_standards', stdColumns, 'code ASC');
const equipment = makeCrudController('electrical_equipment', eqColumns, 'name ASC');
const training = makeCrudController('professional_training', trainingColumns, 'created_at DESC');
const certifications = makeCrudController('certifications', certColumns, 'issued_at DESC');
const audits = makeCrudController('audits', auditColumns, 'audit_date DESC');
const network = makeCrudController('electricians_network', networkColumns, 'rating DESC, name ASC');
const elecCertifications = makeCrudController('electrical_certifications', elecCertColumns, 'name ASC');
const downloadButtons = makeCrudController('download_buttons', downloadBtnColumns, 'created_at DESC');

async function getStandardByCode(req, res) {
    try {
        const std = await service.getByCode(req.params.code);
        res.json(std);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function searchStandards(req, res) {
    try {
        const { query } = req.query;
        const results = await service.search(query);
        res.json(results);
    } catch (err) {
        console.error('Error searching normative articles:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    standards, equipment, training, certifications, audits, network,
    elecCertifications, downloadButtons,
    getStandardByCode, searchStandards,
};
