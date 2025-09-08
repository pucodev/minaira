import type { CompanyNode } from '#models/company.model'
import type CompanyModel from '#models/company.model'
import { type DbService, MainService } from '#services/main.service'
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
      LEFT JOIN user_companies AS uc ON companies.id = uc.company_id
      WHERE uc.user_id = $1 AND uc."role" = $2
    `

    const result = await this.db.query(query, [userId, 'admin'])
    return result.rows
  }

  async createCompany(company: CompanyModel, userId: number) {
    // TODO: Create company
    await this.insert<CompanyNode>(company.node)
    // TODO: Create user_companies
  }
}
