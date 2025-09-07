import fastifyFormbody from '@fastify/formbody'
import Fastify from 'fastify'

import { IS_DEBUG, PORT } from '#config/env'
import { configDbService } from '#db/connection'
import v1Routes from '#routes/v1.route'

const fastify = Fastify({
  logger: IS_DEBUG
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : true,
})

configDbService(fastify)
fastify.register(fastifyFormbody)
fastify.register(v1Routes, { prefix: '/api/v1' })

/**
 * Run the server!
 */
async function start() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
