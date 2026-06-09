const z = require('zod');

const electricalStandardSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    code: z.string().min(1, 'Code requis'),
    category: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
    status: z.string().optional(),
    document_url: z.string().optional(),
    summary: z.string().optional(),
});

const electricalEquipmentSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    brand: z.string().optional(),
    model: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    stock_quantity: z.number().optional(),
    image_url: z.string().optional(),
});

const professionalTrainingSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().optional(),
    duration_hours: z.number().optional(),
    level: z.string().optional(),
    price: z.number().optional(),
    max_participants: z.number().optional(),
    instructor_name: z.string().optional(),
    location: z.string().optional(),
    equipment_provided: z.any().optional(),
    prerequisites: z.any().optional(),
    learning_objectives: z.any().optional(),
});

const certificationSchema = z.object({
    certificate_number: z.string().min(1, 'Numéro requis'),
    holder_name: z.string().min(1, 'Nom requis'),
    type: z.string().optional(),
    expiry_date: z.string().optional(),
    status: z.string().optional(),
    metadata: z.any().optional(),
});

const auditSchema = z.object({
    site_name: z.string().min(1, 'Site requis'),
    location: z.string().optional(),
    inspector_id: z.string().uuid().optional(),
    findings: z.any().optional(),
    compliance_score: z.number().optional(),
    recommendations: z.any().optional(),
});

const electricianSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    specializations: z.any().optional(),
    region: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    projects_count: z.number().optional(),
});

const electricalCertificationSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    code: z.string().min(1, 'Code requis'),
    description: z.string().optional(),
    validity_period: z.number().optional(),
    required_training_hours: z.number().optional(),
    certification_body: z.string().optional(),
    cost: z.number().optional(),
    requirements: z.any().optional(),
    is_active: z.boolean().optional(),
});

const downloadButtonSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    bucket: z.string().optional(),
    path: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    visible: z.boolean().optional(),
});

module.exports = {
    electricalStandardSchema, electricalEquipmentSchema,
    professionalTrainingSchema, certificationSchema,
    auditSchema, electricianSchema,
    electricalCertificationSchema, downloadButtonSchema
};
