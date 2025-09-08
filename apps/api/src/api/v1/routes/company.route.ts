import type { FastifyInstance } from 'fastify'

import { replyError } from '#utils/index'

import {
  createCompany,
  getCompanies,
} from '../controllers/company.controller.ts'

export interface CreateCompanyParams {
  name: string
  slug: string
  categories: number[]
}

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

  fastify.post<{ Body: CreateCompanyParams }>('/', async (request, reply) => {
    try {
      reply.send({
        success: true,
        data: await createCompany(
          fastify,
          request.auth_user?.user_id,
          request.body,
        ),
      })
    } catch (error) {
      replyError(reply, error)
    }
  })
}
