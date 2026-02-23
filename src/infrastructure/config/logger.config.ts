import pino from 'pino'

const logLevel = process.env.LOG_LEVEL ?? 'info'

export const logger = pino({
  level: logLevel,
  redact: {
    paths: ['req.headers.authorization', 'password', 'password_hash'],
    censor: '[REDACTED]',
  },
})
