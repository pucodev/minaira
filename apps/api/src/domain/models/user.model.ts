import bcrypt from 'bcrypt'

import MainModel, { type MainNode } from '#models/main.model'
import { ApiError } from '#utils/errors'

export interface UserNode extends MainNode {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  password?: string
  is_active?: boolean
  country_id?: number
}

export default class UserModel extends MainModel<UserNode> {
  static async buildRegister(
    firstName: string | undefined,
    lastName: string | undefined,
    email: string | undefined,
    password: string | undefined,
    countryId: number | undefined,
  ) {
    if (!firstName || !lastName || !email || !password || !countryId) {
      throw new ApiError('AUTH_REGISTER_ALL_FIELDS_REQUIRED', 422)
    }

    if (password.length < 8) {
      throw new ApiError('AUTH_REGISTER_PASSWORD', 422)
    }

    return new UserModel({
      first_name: firstName,
      last_name: lastName,
      email,
      password: await UserModel.hashPassword(password),
      country_id: countryId,
    })
  }

  /**
   * Cleans the data associated with the node by trimming whitespace from the first name, last name, and email,
   * and converting the email to lowercase.
   */
  cleanData() {
    if (this.node?.first_name) {
      this.node.first_name = this.node.first_name.trim()
    }
    if (this.node?.last_name) {
      this.node.last_name = this.node.last_name.trim()
    }
    if (this.node?.email) {
      this.node.email = this.node.email.trim().toLowerCase()
    }
  }

  public static async hashPassword(password: string) {
    return await bcrypt.hash(password, 12)
  }
}
