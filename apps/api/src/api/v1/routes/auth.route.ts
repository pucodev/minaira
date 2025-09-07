import type { FastifyInstance } from 'fastify'

import { ApiError } from '#utils/errors'
import { getErrorMessage } from '#utils/index'
import { applog } from '#utils/logger'

import { registerUser } from '../controllers/auth.controller.ts'

export interface RegisterParams {
  first_name: string
  last_name: string
  email: string
  password: string
  country_id: number
}

/**
 * User routes
 *
 * @param fastify - fastify instance
 */
export function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterParams }>(
    '/register',
    async (request, reply) => {
      try {
        reply.send(await registerUser(fastify, request.body))
      } catch (error) {
        applog.errorApi(error)
        if (error instanceof ApiError) {
          reply.status(error.statusCode).send({ error: error.getPayload() })
        } else {
          reply.status(500).send({ error: getErrorMessage(error) })
        }
      }
    },
  )
}
