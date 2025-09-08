import type { FastifyInstance } from 'fastify'

import type { CompanyNode } from '#models/company.model'
import UserModel from '#models/user.model'
import type { LoginParams, RegisterParams } from '#routes/auth.route'
import { CompanyService } from '#services/company.service'
import { UserService } from '#services/user.service'
import { ApiError } from '#utils/errors'
import { applog } from '#utils/logger'

/**
 * Create new user
 *
 * @param fastify -
 * @param registerNode -
 * @returns - Created user
 */
export async function registerUser(
  fastify: FastifyInstance,
  registerNode: RegisterParams,
) {
  const baseUserModel = new UserModel({
    first_name: registerNode.first_name,
    last_name: registerNode.last_name,
    email: registerNode.email,
    password: registerNode.password,
    country_id: registerNode.country_id,
  })
  baseUserModel.cleanData()

  const userService = new UserService(fastify.pg)

  // =================================
  // Validate that user does not exist
  // =================================
  if (baseUserModel.node.email) {
    const users = await userService.queryFromServiceQuery({
      fields: ['id', 'email'],
      search: {
        conditions: [
          {
            field: 'email',
            value: baseUserModel.node.email,
            operator: 'exact',
          },
        ],
      },
    })

    applog.debug({ registered_users: users })

    if (users.length > 0) {
      throw new ApiError('AUTH_USER_ALREADY_EXISTS', 409)
    }
  }

  const userModel = await UserModel.buildRegister(
    baseUserModel.node.first_name,
    baseUserModel.node.last_name,
    baseUserModel.node.email,
    baseUserModel.node.password,
    baseUserModel.node.country_id,
  )

  const createdUser = await userService.register(userModel)
  applog.debug('========== CREATED USER ==========')
  applog.debug(createdUser)
  applog.debug('==================================')

  const createdUserModel = new UserModel(createdUser)

  return {
    user: createdUserModel.getData(),
    tokens: createdUserModel.getTokens(),
  }
}

/**
 * Login user
 *
 * @param fastify -
 * @param loginNode -
 * @returns - user
 */
export async function loginUser(
  fastify: FastifyInstance,
  loginNode: LoginParams,
) {
  // TODO: Implement rate limiting for login attempts from the same IP address

  const baseUserModel = UserModel.buildLogin(
    loginNode.email,
    loginNode.password,
  )
  baseUserModel.cleanData()

  if (baseUserModel.node.email) {
    const userService = new UserService(fastify.pg)
    const users = await userService.queryFromServiceQuery({
      search: {
        conditions: [
          {
            field: 'email',
            operator: 'exact',
            value: baseUserModel.node.email,
          },
        ],
      },
    })

    if (users.length === 0) {
      throw new ApiError('AUTH_LOGIN_INVALID', 403)
    }

    const userModel = new UserModel(users[0])
    const isValidPassword = await userModel.isValidPassword(loginNode.password)

    if (!isValidPassword) {
      throw new ApiError('AUTH_LOGIN_INVALID', 403)
    }

    // Add companies
    const companyService = new CompanyService(fastify.pg)
    let companies: CompanyNode[] = []
    if (userModel.node.id) {
      companies = await companyService.fetch(userModel.node.id)
    }

    return {
      user: userModel.getData(),
      tokens: userModel.getTokens(),
      companies,
    }
  }
}
