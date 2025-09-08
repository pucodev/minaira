import type { FastifyInstance } from 'fastify'

import type { CompanyNode } from '#models/company.model'
import { CompanyService } from '#services/company.service'
import { ApiError } from '#utils/errors'

/**
 * Get companies from userId
 *
 * @param fastify - Fastify instance
 * @param userId - userId
 *
 * @returns companies
 */
export async function getCompanies(
  fastify: FastifyInstance,
  userId: number | undefined,
) {
  if (typeof userId === 'undefined' || !userId) {
    throw new ApiError('COMPANIES_NO_USER')
  }

  const companyService = new CompanyService(fastify.pg)
  const companies = await companyService.fetch<CompanyNode>(userId)
  return companies
}
