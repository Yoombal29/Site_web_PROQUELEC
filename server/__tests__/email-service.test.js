const { emailTemplates } = require('../email-service');

describe('emailTemplates', () => {
    test('welcome template', () => {
        const result = emailTemplates.welcome('Alice');
        expect(result.subject).toContain('Bienvenue');
        expect(result.html).toContain('Alice');
    });

    test('formationConfirmation template', () => {
        const result = emailTemplates.formationConfirmation('NF C 15-100', 'Bob');
        expect(result.subject).toContain('NF C 15-100');
        expect(result.html).toContain('Bob');
    });

    test('certificationNotification template', () => {
        const result = emailTemplates.certificationNotification('Certif Pro', 'Charlie');
        expect(result.subject).toContain('Certif Pro');
        expect(result.html).toContain('Charlie');
    });

    test('contact template', () => {
        const result = emailTemplates.contact('David', 'david@test.com', 'Question', 'Bonjour');
        expect(result.subject).toContain('Question');
        expect(result.html).toContain('David');
        expect(result.html).toContain('david@test.com');
    });
});
