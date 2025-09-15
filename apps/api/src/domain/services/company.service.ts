import type { CompanyNode } from '#models/company.model'
import type CompanyModel from '#models/company.model'
import type LocationModel from '#models/location.model'
import {
  type CompanyUserNode,
  CompanyUserService,
} from '#services/companyUser.service'
import { type DbService, MainService } from '#services/main.service'
import { ApiError } from '#utils/errors'
import { getQuery } from '#utils/queryService'

import { LocationService } from './location.service.ts'
import { UserService } from './user.service.ts'

export class CompanyService extends MainService<CompanyNode> {
  static TABLE_NAME = 'companies'

  constructor(db: DbService) {
    super(db, CompanyService.TABLE_NAME, [
      { key: 'id', type: 'number' },
      { key: 'name', type: 'string' },
      { key: 'slug', type: 'string' },
      { key: 'created_at', type: 'string' },
      { key: 'updated_at', type: 'string' },
    ])
  }

  async fetch<Node>(userId: number): Promise<Node[]> {
    const data = getQuery('', this.dbFields, this.tableName, true)

    const query = `
    ${data.sql} 
      LEFT JOIN ${CompanyUserService.TABLE_NAME} AS uc ON companies.id = uc.company_id
      WHERE uc.user_id = $1 AND uc."role" = $2
    `

    const result = await this.db.query(query, [userId, 'admin'])
    return result.rows
  }

  async createCompany(company: CompanyModel, userId: number) {
    return this.db.transact(async client => {
      let createdCompany
      try {
        createdCompany = await this.insertTransact<CompanyNode>(
          company.node,
          client,
        )
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
            'duplicate key value violates unique constraint "companies_slug_key"'
        ) {
          throw new ApiError('COMPANIES_SLUG_ALREADY_EXIST')
        } else {
          throw error
        }
      }

      // Create company_user
      const service = new CompanyUserService(this.db)
      const companyUser = await service.insertTransact<CompanyUserNode>(
        {
          company_id: createdCompany.id,
          user_id: userId,
          role: 'admin',
        },
        client,
      )

      return {
        company: createdCompany,
        company_user: companyUser,
      }
    })
  }

  async createLocation(
    location: LocationModel,
    userId: number,
    companyId: number,
  ) {
    // Verify that it belongs to the company and is an admin
    const companyUsers = await this.db.query<{
      name: string
      company__country_id: number
      user__country_id: number
    }>(
      `SELECT c.name, c.country_id as company__country_id, u.country_id as user__country_id
        FROM ${CompanyUserService.TABLE_NAME} as cu
        LEFT JOIN ${CompanyService.TABLE_NAME} as c ON c.id = cu.company_id
        LEFT JOIN ${UserService.TABLE_NAME} as u ON u.id = cu.user_id
        WHERE
          cu.user_id = $1 AND cu.role = $2 AND cu.company_id = $3`,
      [userId, 'admin', companyId],
    )

    if (companyUsers.rows.length !== 1) {
      throw new ApiError('LOCATIONS_UNAUTHORIZED_COMPANY')
    }

    const companyUser = companyUsers.rows[0]
    const locationService = new LocationService(this.db)
    // We set the country id if it comes in the request or we get it from the company or the user
    location.node.country_id =
      location.node.country_id ||
      companyUser.company__country_id ||
      companyUser.user__country_id

    const data = await locationService.insert(location.node)
    return { company_users: companyUsers.rows, data }
  }
}
