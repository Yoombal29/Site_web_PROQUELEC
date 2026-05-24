type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  sessionId?: string;
  pageId?: string;
  blockId?: string;
  action?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: unknown;
  url: string;
  userAgent: string;
  stack?: string;
}

/**
 * Structured Logging Service
 * Provides centralized, structured logging with context and persistence
 */
class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = crypto.randomUUID();
  }

  private async persist(log: LogEntry) {
    // Attempt persistence to server
    try {
      await fetch('/api/admin/system/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(log)
      });
    } catch {
      // Silently fail if server is unavailable
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const contextStr = context ? ` [${Object.entries(context).map(([k, v]) => `${k}=${v}`).join(', ')}]` : '';
    return `[${level.toUpperCase()}]${contextStr} ${message}`;
  }

  log(level: LogLevel, message: string, context?: LogContext, data?: unknown) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: level === 'error' || level === 'fatal' ? new Error().stack : undefined
    };

    // Console output with colors
    const colors = {
      debug: 'gray',
      info: 'skyblue',
      warn: 'orange',
      error: 'red',
      fatal: 'magenta'
    };

    const formattedMessage = this.formatMessage(level, message, context);

    if (level === 'error' || level === 'fatal') {
      console.error(formattedMessage, data || '');
    } else if (level === 'warn') {
      console.warn(formattedMessage, data || '');
    } else if (level === 'debug') {
      console.debug(formattedMessage, data || '');
    } else {
      console.log(formattedMessage, data || '');
    }

    // Local memory persistence
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) this.logs.pop();

    // Server persistence
    this.persist(logEntry);
  }

  debug(message: string, context?: LogContext, data?: unknown) {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: LogContext, data?: unknown) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: LogContext, data?: unknown) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: LogContext, data?: unknown) {
    this.log('error', message, context, data);
  }

  fatal(message: string, context?: LogContext, data?: unknown) {
    this.log('fatal', message, context, data);
  }

  getHistory(): LogEntry[] {
    return this.logs;
  }

  clearHistory() {
    this.logs = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const logger = new LoggerService();

// Builder-specific logging helpers
export const builderLogger = {
  blockAdded: (blockId: string, blockType: string) => {
    logger.info('Block added', { blockId, blockType, action: 'block_added' });
  },

  blockRemoved: (blockId: string, blockType: string) => {
    logger.info('Block removed', { blockId, blockType, action: 'block_removed' });
  },

  blockUpdated: (blockId: string, blockType: string, field: string) => {
    logger.debug('Block updated', { blockId, blockType, field, action: 'block_updated' });
  },

  pageSaved: (pageId: string, blockCount: number) => {
    logger.info('Page saved', { pageId, blockCount, action: 'page_saved' });
  },

  pageLoaded: (pageId: string, blockCount: number) => {
    logger.info('Page loaded', { pageId, blockCount, action: 'page_loaded' });
  },

  undoPerformed: (historyIndex: number) => {
    logger.info('Undo performed', { historyIndex, action: 'undo' });
  },

  redoPerformed: (historyIndex: number) => {
    logger.info('Redo performed', { historyIndex, action: 'redo' });
  },

  templateSaved: (templateId: string, templateName: string) => {
    logger.info('Template saved', { templateId, templateName, action: 'template_saved' });
  },

  templateDeleted: (templateId: string) => {
    logger.info('Template deleted', { templateId, action: 'template_deleted' });
  },

  error: (message: string, context?: LogContext, data?: unknown) => {
    logger.error(message, context, data);
  }
};