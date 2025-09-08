import type { FastifyInstance } from 'fastify'

import { replyError } from '#utils/index'

import { loginUser, registerUser } from '../controllers/auth.controller.ts'

export interface RegisterParams {
  first_name: string
  last_name: string
  email: string
  password: string
  country_id: number
}

export interface LoginParams {
  email: string
  password: string
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
        reply.send({
          success: true,
          data: await registerUser(fastify, request.body),
        })
      } catch (error) {
        replyError(reply, error)
      }
    },
  )

  fastify.post<{ Body: LoginParams }>('/login', async (request, reply) => {
    try {
      reply.send({
        success: true,
        data: await loginUser(fastify, request.body),
      })
    } catch (error) {
      replyError(reply, error)
    }
  })
}
