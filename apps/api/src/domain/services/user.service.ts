import type { UserNode } from '#models/user.model'
import type UserModel from '#models/user.model'

import { type DbService, MainService } from './main.service.ts'

export class UserService extends MainService<UserNode> {
  constructor(db: DbService) {
    super(db, 'users', [
      { key: 'first_name', type: 'string' },
      { key: 'last_name', type: 'string' },
      { key: 'password', type: 'string' },
      { key: 'email', type: 'string' },
      { key: 'country_id', type: 'string' },
      { key: 'phone', type: 'string' },
      { key: 'is_active', type: 'boolean' },
      { key: 'created_at', type: 'string' },
      { key: 'updated_at', type: 'string' },
    ])
  }

  async register(userModel: UserModel) {
    const params: UserNode = {
      first_name: userModel.node.first_name,
      last_name: userModel.node.last_name,
      email: userModel.node.email,
      password: userModel.node.password,
      country_id: userModel.node.country_id,
    }

    return this.insert(params)
  }
}
