import type { CompanyNode } from '#models/company.model'
import type CompanyModel from '#models/company.model'
import {
  type CompanyUserNode,
  CompanyUserService,
} from '#services/companyUser.service'
import { type DbService, MainService } from '#services/main.service'
import { ApiError } from '#utils/errors'
import { getQuery } from '#utils/queryService'

export class CompanyService extends MainService<CompanyNode> {
  constructor(db: DbService) {
    super(db, 'companies', [
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
      LEFT JOIN company_users AS uc ON companies.id = uc.company_id
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
}
