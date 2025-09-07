import type { FastifyInstance } from 'fastify'

import { UserService } from '#services/user.service'

/**
 * User routes
 *
 * @param fastify - fastify instance
 */
export function userRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: Record<string, string> }>(
    '/',
    async (request, reply) => {
      const query = request.query
      try {
        const userService = new UserService(fastify.pg)
        const response = await userService.queryFromString(query)
        reply.send(response)
      } catch (error) {
        reply.send(error)
      }
    },
  )
}
