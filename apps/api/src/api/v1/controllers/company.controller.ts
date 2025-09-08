import type { FastifyInstance } from 'fastify'

import type { CompanyNode } from '#models/company.model'
import CompanyModel from '#models/company.model'
import type { CreateCompanyParams } from '#routes/company.route'
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

/**
 *
 * @param fastify
 * @param userId
 * @param params
 */
export async function createCompany(
  fastify: FastifyInstance,
  userId: number | undefined,
  params: CreateCompanyParams,
) {
  if (typeof userId === 'undefined' || !userId) {
    throw new ApiError('COMPANIES_NO_USER')
  }

  const company = CompanyModel.buildCreateCompany(params.name, params.slug)
  const companyService = new CompanyService(fastify.pg)
  const companyCreated = await companyService.insert<CompanyNode>(company.node)
  return companyCreated
}
