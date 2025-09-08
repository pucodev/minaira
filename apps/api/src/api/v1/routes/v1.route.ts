import type { FastifyInstance } from 'fastify'

import { authenticate } from '#midlewares/auth'
import { authRoutes } from '#routes/auth.route'

import { companyRoutes } from './company.route.ts'

/**
 * V1 Api routes
 *
 * @param fastify - fastify instance
 */
export default async function v1Routes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' })

  // authenticate routes
  fastify.register(async instance => {
    instance.addHook('preHandler', authenticate)

    instance.register(companyRoutes, { prefix: '/companies' })
  })
}
