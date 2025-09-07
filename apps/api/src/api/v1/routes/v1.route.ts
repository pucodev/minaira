import type { FastifyInstance } from 'fastify'

import { authRoutes } from '#routes/auth.route'

/**
 * V1 Api routes
 *
 * @param fastify - fastify instance
 */
export default async function v1Routes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' })
}
