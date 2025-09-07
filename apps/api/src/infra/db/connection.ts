import fastifyPostgres from '@fastify/postgres'
import type { FastifyInstance } from 'fastify'

import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from '#config/env'
import { assertDefined } from '#utils/assert'

/**
 * Retrieves database configuration from environment variables.
 *
 * @throws {Error} If any required environment variable is missing or incorrect.
 * @returns The database configuration object.
 */
export function getDbConfig() {
  assertDefined(DB_USER, 'DB_USER')
  assertDefined(DB_PASSWORD, 'DB_PASSWORD')
  assertDefined(DB_HOST, 'DB_HOST')
  assertDefined(DB_PORT, 'DB_PORT')
  assertDefined(DB_DATABASE, 'DB_DATABASE')

  const config: fastifyPostgres.PostgresPluginOptions = {
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_DATABASE,
  }

  // Only for prod
  if (typeof process.env.DB_REJECT_UNAUTHORIZED_SSL === 'undefined') {
    config.ssl = {
      rejectUnauthorized: false,
    }
  }

  return config
}

/**
 * Configure fastify database credentials from the environment
 *
 * @param fastify  Encapsulated Fastify Instance
 */
export function configDbService(fastify: FastifyInstance) {
  fastify.register(fastifyPostgres, getDbConfig())
}
