const { Router } = require('express');
const ctrl = require('./catalog.controller');
const { authenticateToken, validate } = require('../../core/middleware');
const {
    electricalStandardSchema, electricalEquipmentSchema,
    professionalTrainingSchema, certificationSchema,
    auditSchema, electricianSchema,
    electricalCertificationSchema, downloadButtonSchema
} = require('./catalog.validator');

const router = Router();

router.get('/electrical-standards', ctrl.standards.list);
router.get('/electrical-standards/code/:code', ctrl.getStandardByCode);
router.post('/electrical-standards', authenticateToken, validate(electricalStandardSchema), ctrl.standards.create);
router.put('/electrical-standards/:id', authenticateToken, validate(electricalStandardSchema), ctrl.standards.update);
router.delete('/electrical-standards/:id', authenticateToken, ctrl.standards.remove);

router.get('/electrical-equipment', ctrl.equipment.list);
router.post('/electrical-equipment', authenticateToken, validate(electricalEquipmentSchema), ctrl.equipment.create);
router.put('/electrical-equipment/:id', authenticateToken, validate(electricalEquipmentSchema), ctrl.equipment.update);
router.delete('/electrical-equipment/:id', authenticateToken, ctrl.equipment.remove);

router.get('/professional-training', ctrl.training.list);
router.post('/professional-training', authenticateToken, validate(professionalTrainingSchema), ctrl.training.create);
router.put('/professional-training/:id', authenticateToken, validate(professionalTrainingSchema), ctrl.training.update);
router.delete('/professional-training/:id', authenticateToken, ctrl.training.remove);

router.get('/certifications', ctrl.certifications.list);
router.post('/certifications', authenticateToken, validate(certificationSchema), ctrl.certifications.create);

router.get('/audits', authenticateToken, ctrl.audits.list);
router.post('/audits', authenticateToken, validate(auditSchema), ctrl.audits.create);

router.get('/network/electricians', ctrl.network.list);
router.post('/network/electricians', authenticateToken, validate(electricianSchema), ctrl.network.create);

router.get('/electrical-certifications', ctrl.elecCertifications.list);
router.post('/electrical-certifications', authenticateToken, validate(electricalCertificationSchema), ctrl.elecCertifications.create);
router.put('/electrical-certifications/:id', authenticateToken, validate(electricalCertificationSchema), ctrl.elecCertifications.update);
router.delete('/electrical-certifications/:id', authenticateToken, ctrl.elecCertifications.remove);

router.get('/download-buttons', ctrl.downloadButtons.list);
router.post('/download-buttons', authenticateToken, validate(downloadButtonSchema), ctrl.downloadButtons.create);
router.put('/download-buttons/:id', authenticateToken, validate(downloadButtonSchema), ctrl.downloadButtons.update);
router.delete('/download-buttons/:id', authenticateToken, ctrl.downloadButtons.remove);

router.get('/normative-articles', ctrl.searchStandards);

module.exports = { router, basePath: '/api' };
