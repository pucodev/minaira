import type { FastifyInstance } from 'fastify'

import UserModel from '#models/user.model'
import type { RegisterParams } from '#routes/auth.route'
import { UserService } from '#services/user.service'

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
  const userService = new UserService(fastify.pg)
  const userModel = await UserModel.buildRegister(
    registerNode.first_name,
    registerNode.last_name,
    registerNode.email,
    registerNode.password,
    registerNode.country_id,
  )
  return await userService.register(userModel)
}
