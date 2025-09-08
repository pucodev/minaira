import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'

import { AUTH_SECRET_TOKEN } from '#config/env'
import type { DecodedToken } from '#models/user.model'
import { ApiError } from '#utils/errors'
import { replyError } from '#utils/index'
import { applog } from '#utils/logger'

/**
 * Add `auth_user` to reques if token is valid
 *
 * @param request -
 * @param reply -
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    auth(request)
  } catch (error) {
    replyError(reply, error)
  }
}

/**
 * Add `auth_user` to reques if token is valid
 *
 * @param request -
 */
function auth(request: FastifyRequest) {
  const token = request.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new ApiError('AUTH_TOKEN_INVALID', 403)
  }

  if (typeof AUTH_SECRET_TOKEN === 'undefined' || AUTH_SECRET_TOKEN === '') {
    throw new ApiError('AUTH_REGISTER_NO_SECRET_TOKEN', 500)
  }
  const key = AUTH_SECRET_TOKEN

  try {
    const data = jwt.verify(token, key) as DecodedToken
    request.auth_user = data
    applog.debug('========== AUTH ==========')
    applog.debug(data)
    applog.debug('====================')
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error) {
      const err = error as { name: string }

      if (err.name === 'TokenExpiredError') {
        throw new ApiError('AUTH_TOKEN_EXPIRED')
      }

      if (err.name === 'JsonWebTokenError') {
        throw new ApiError('AUTH_TOKEN_ERROR')
      }
    }

    throw new ApiError('AUTH_TOKEN_UNKNOWN')
  }
}
