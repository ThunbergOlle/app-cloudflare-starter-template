export class Logger {
  private requestId: string;
  private userId?: number;
  private ip?: string;
  private env?: Env;

  constructor(
    requestId?: string,
    userId?: number,
    { env, ip }: { env?: Env; ip?: string } = {},
  ) {
    this.requestId = requestId || crypto.randomUUID().slice(0, 8);
    this.userId = userId;
    this.ip = ip;
    this.env = env;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const requestIdPart = this.requestId
      ? `[${this.requestId}]`
      : '[no-req-id]';
    const userIdPart = this.userId ? ` [user:${this.userId}]` : '';
    const ipPart = this.ip ? ` [ip:${this.ip}]` : '';
    const levelPart = level.toUpperCase();
    const prefix = `${requestIdPart}${userIdPart}${ipPart} ${levelPart}:`;
    if (meta) {
      return `${prefix} ${message} ${JSON.stringify(meta)}`;
    }
    return `${prefix} ${message}`;
  }

  info(message: string, meta?: any): void {
    const log = this.formatMessage('info', message, meta);

    console.log(log);

    if (this.env?.PAPERTRAIL_API_KEY) {
      sendToPapertrail(log, this.env.PAPERTRAIL_API_KEY);
    }
  }

  error(message: string, meta?: any): void {
    const log = this.formatMessage('error', message, meta);

    console.error(log);

    if (this.env?.PAPERTRAIL_API_KEY) {
      sendToPapertrail(log, this.env.PAPERTRAIL_API_KEY);
    }
  }

  warn(message: string, meta?: any): void {
    const log = this.formatMessage('warn', message, meta);

    console.warn(log);

    if (this.env?.PAPERTRAIL_API_KEY) {
      sendToPapertrail(log, this.env.PAPERTRAIL_API_KEY);
    }
  }

  debug(message: string, meta?: any): void {
    const log = this.formatMessage('debug', message, meta);

    console.log(log);

    if (this.env?.PAPERTRAIL_API_KEY) {
      sendToPapertrail(log, this.env.PAPERTRAIL_API_KEY);
    }
  }
}

export function sendToPapertrail(log: string, apiKey: string) {
  const auth = 'Basic ' + btoa(':' + apiKey);

  fetch('https://logs.collector.solarwinds.com/v1/log', {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: log,
  });
}

// Factory function for creating logger instances
export function createLogger(
  requestId?: string,
  userId?: number,
  { env, ip }: { env?: Env; ip?: string } = {},
): Logger {
  return new Logger(requestId, userId, { env, ip });
}

// Global logger instance for backwards compatibility and non-request contexts
export const log = new Logger('global');
