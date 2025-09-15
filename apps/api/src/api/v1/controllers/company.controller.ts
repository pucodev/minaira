import type { FastifyInstance } from 'fastify'

import type { CompanyNode } from '#models/company.model'
import CompanyModel from '#models/company.model'
import LocationModel, { type LocationNode } from '#models/location.model'
import type {
  CreateCompanyBody,
  CreateLocationBody,
} from '#routes/company.route'
import { CompanyService } from '#services/company.service'
import { ApiError } from '#utils/errors'
import { Point } from '#utils/queryService'

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
  params: CreateCompanyBody,
) {
  if (typeof userId === 'undefined' || !userId) {
    throw new ApiError('COMPANIES_NO_USER')
  }

  const company = CompanyModel.buildCreateCompany(params.name, params.slug)
  const companyService = new CompanyService(fastify.pg)
  const companyCreated = await companyService.createCompany(company, userId)
  return companyCreated
}

/**
 *
 * @param fastify
 * @param userId
 * @param companyId
 * @param params
 */
export async function createLocation(
  fastify: FastifyInstance,
  userId: number | undefined,
  companyId: number | undefined,
  params: CreateLocationBody,
) {
  if (
    typeof userId === 'undefined' ||
    !userId ||
    typeof companyId === 'undefined' ||
    !companyId
  ) {
    throw new ApiError('LOCATIONS_NO_USER_COMPANY')
  }

  const companyService = new CompanyService(fastify.pg)
  const locationNode: LocationNode = {
    name: params.name,
    company_id: companyId,
    country_id: params.country_id,
  }

  if (params.lat && params.lon) {
    locationNode.location = new Point(params.lon, params.lat)
  }

  const companyCreated = await companyService.createLocation(
    new LocationModel(locationNode),
    userId,
    companyId,
  )
  return companyCreated
}
