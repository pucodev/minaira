import type { FastifyInstance } from 'fastify'

import {
  createCompany,
  createLocation,
  getCompanies,
} from '#controllers/company.controller'
import { replyError } from '#utils/index'

export interface CreateCompanyBody {
  name: string
  slug: string
  categories: number[]
}

export interface CreateLocationBody {
  name: string
  lat?: number
  lon?: number
  country_id?: number
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

  fastify.post<{ Body: CreateCompanyBody }>('/', async (request, reply) => {
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

  fastify.post<{ Body: CreateLocationBody; Params: { companyId: number } }>(
    '/:companyId/locations',
    async (request, reply) => {
      try {
        reply.send({
          success: true,
          data: await createLocation(
            fastify,
            request.auth_user?.user_id,
            request.params.companyId,
            request.body,
          ),
        })
      } catch (error) {
        replyError(reply, error)
      }
    },
  )
}
