type LogLevel = 'info' | 'warn' | 'error';

/**
 * Service de logging centralisé.
 * En production, ces logs pourraient être envoyés vers une table SQL ou un service externe.
 */
class LoggerService {
  private logs: unknown[] = [];
  private maxLogs = 1000;

  private async persist(log: unknown) {
    // Tentative de persistance en base via API
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


      // Silencieusement échouer si le serveur est inaccessible
    }}
  log(level: LogLevel, message: string, data?: unknown) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Console pour les devtools
    const color = level === 'error' ? 'red' : level === 'warn' ? 'orange' : 'skyblue';


    // Persistance mémoire locale
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) this.logs.pop();

    // Persistance serveur
    this.persist(logEntry);
  }

  info(message: string, data?: unknown) {this.log('info', message, data);}
  warn(message: string, data?: unknown) {this.log('warn', message, data);}
  error(message: string, data?: unknown) {this.log('error', message, data);}

  getHistory() {return this.logs;}
}

export const logger = new LoggerService();