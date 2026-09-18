const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, data?: unknown) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, data);
    }
  },
  warn: (message: string, data?: unknown) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
  info: (message: string, data?: unknown) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, data);
    }
  },
  debug: (message: string, data?: unknown) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};