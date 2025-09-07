import type { FastifyInstance } from 'fastify'

import UserModel from '#models/user.model'
import type { RegisterParams } from '#routes/auth.route'
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
  return await userService.register(userModel)
}
