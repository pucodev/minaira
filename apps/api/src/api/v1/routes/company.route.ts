import type { FastifyInstance } from 'fastify'

import { replyError } from '#utils/index'

import { getCompanies } from '../controllers/company.controller.ts'

/**
 * Company routes
 *
 * @param fastify - fastify instance
 */
export function companyRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    try {
      reply.send({
        success: true,
        data: await getCompanies(fastify, request.auth_user?.user_id),
      })
    } catch (error) {
      replyError(reply, error)
    }
  })
}
