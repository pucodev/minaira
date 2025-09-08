import 'fastify'

import type { DecodedToken } from '#models/user.model'

declare module 'fastify' {
  interface FastifyRequest {
    auth_user?: DecodedToken
  }
}
