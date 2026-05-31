const pino = require('pino');
const pinoHttp = require('pino-http');

const logBuffer = [];
const MAX_LOGS = 100;

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
        level(label) { return { level: label }; }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token'],
        censor: '[REDACTED]'
    }
});

const httpLogger = pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => req.url === '/api/health' || req.url === '/health'
    }
});

const logToBuffer = (msg, type = 'info') => {
    const entry = {
        timestamp: new Date().toISOString(),
        type,
        message: typeof msg === 'string' ? msg.trim() : String(msg)
    };
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOGS) logBuffer.shift();
};

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
    const msg = args.map(a => String(a)).join(' ');
    logger.info(msg);
    logToBuffer(msg, 'info');
};

console.error = (...args) => {
    const msg = args.map(a => String(a)).join(' ');
    logger.error(msg);
    logToBuffer(msg, 'error');
};

console.warn = (...args) => {
    const msg = args.map(a => String(a)).join(' ');
    logger.warn(msg);
    logToBuffer(msg, 'warn');
};

function getLogs() {
    return [...logBuffer];
}

module.exports = { logger, httpLogger, getLogs, logToBuffer };
