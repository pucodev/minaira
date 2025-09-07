import pino, { type Logger } from 'pino'

import { IS_DEBUG, LOG_LEVEL } from '#config/env'

const logger: Logger = pino({
  level: LOG_LEVEL,
  transport: IS_DEBUG
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

export const applog = {
  info: (msg: string | object | unknown, ...args: any[]) =>
    logger.info(msg, ...args),
  warn: (msg: string | object | unknown, ...args: any[]) =>
    logger.warn(msg, ...args),
  error: (msg: string | object | unknown, ...args: any[]) =>
    logger.error(msg, ...args),
  debug: (msg: string | object | unknown, ...args: any[]) =>
    logger.debug(msg, ...args),

  // Custom
  errorApi: (msg: string | object | unknown, ...args: any[]) =>
    logger.error(msg, ...args),
}

export default logger
