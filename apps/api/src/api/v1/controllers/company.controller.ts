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
 * Create company and company_user as admin
 *
 * @param fastify - fastify instance
 * @param userId - user that realted to company in compny user as admin
 * @param params - company params
 *
 * @returns Company and company user created
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
  const companyCreated = await companyService.createCompany(company, userId)
  return companyCreated
}
