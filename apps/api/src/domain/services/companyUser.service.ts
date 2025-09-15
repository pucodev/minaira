import { type DbService, MainService } from '#services/main.service'

export interface CompanyUserNode {
  user_id?: number
  company_id?: number
  role?: 'admin' | 'customer' | 'staff'
}

export class CompanyUserService extends MainService<CompanyUserNode> {
  static TABLE_NAME = 'company_users'

  constructor(db: DbService) {
    super(db, CompanyUserService.TABLE_NAME, [
      { key: 'id', type: 'number' },
      { key: 'user_id', type: 'number' },
      { key: 'role', type: 'string' },
      { key: 'company_id', type: 'number' },
      { key: 'created_at', type: 'string' },
      { key: 'updated_at', type: 'string' },
    ])
  }
}
