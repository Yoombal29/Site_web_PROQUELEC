const { emailTemplates, sendEmail } = require('../email-service');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log('\x1b[32m\u2713\x1b[0m', name);
        passed++;
    } catch (e) {
        console.log('\x1b[31m\u2717\x1b[0m', name, '-', e.message);
        failed++;
    }
}

test('welcome template', () => {
    const r = emailTemplates.welcome('Alice');
    if (!r.subject.includes('Bienvenue')) throw new Error('subject fail');
    if (!r.html.includes('Alice')) throw new Error('html fail');
});

test('formationConfirmation template', () => {
    const r = emailTemplates.formationConfirmation('NF C 15-100', 'Bob');
    if (!r.subject.includes('NF C 15-100')) throw new Error('subject fail');
    if (!r.html.includes('Bob')) throw new Error('html fail');
});

test('certificationNotification template', () => {
    const r = emailTemplates.certificationNotification('Certif Pro', 'Charlie');
    if (!r.subject.includes('Certif Pro')) throw new Error('subject fail');
});

test('contact template', () => {
    const r = emailTemplates.contact('David', 'david@test.com', 'Question', 'Bonjour');
    if (!r.html.includes('david@test.com')) throw new Error('html fail');
});

test('sendEmail simule sans SMTP', async () => {
    const r = await sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Test</p>' });
    if (!r.simulated) throw new Error('should be simulated');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
