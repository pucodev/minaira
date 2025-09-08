export const IS_DEBUG = process.env.DEBUG === 'true'
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
export const PORT: number = Number(process.env.PORT) || 3000

export const AUTH_SECRET_TOKEN: string | undefined =
  process.env.AUTH_SECRET_TOKEN

export const DB_USER = process.env.DB_USER
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_HOST = process.env.DB_HOST
export const DB_PORT = process.env.DB_PORT
export const DB_DATABASE = process.env.DB_DATABASE
export const DB_REJECT_UNAUTHORIZED_SSL = process.env.DB_REJECT_UNAUTHORIZED_SSL
