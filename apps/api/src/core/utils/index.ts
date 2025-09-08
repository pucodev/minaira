import type { FastifyReply } from 'fastify'

import { ApiError } from './errors.ts'
import { applog } from './logger.ts'

/**
 * Safely converts a value to a number, validating its type and format.
 *
 * - Trims strings before parsing.
 * - Throws if the value is empty, NaN, or not finite.
 * - Validates integers when type is set to `"int"`.
 * - Allows decimals when type is set to `"float"`.
 *
 * @param value - The input value to be converted.
 * @param type - The expected number type, `"int"` for integers or `"float"` for decimals. Defaults to `"float"`.
 * @returns The parsed and validated number.
 * @throws {Error} If the value is empty, not a valid number, or not of the expected type.
 *
 * @example
 * toNumberSafe(" 42 ", "int");    // returns 42
 * toNumberSafe("3.14", "float");  // returns 3.14
 * toNumberSafe("", "int");        // throws Error("Empty value is not allowed")
 * toNumberSafe("abc");            // throws Error("Value is not a valid number")
 * toNumberSafe("4.5", "int");     // throws Error("Value is not a valid integer")
 */
export function toNumberSafe(
  value: any,
  type: 'int' | 'float' = 'float',
): number {
  if (typeof value === 'string') {
    value = value.trim()
    if (value === '') {
      throw new Error('Empty value is not allowed')
    }
  }

  const n = Number(value)

  if (isNaN(n) || !isFinite(n)) {
    throw new Error('Value is not a valid number')
  }

  if (type === 'int' && !Number.isInteger(n)) {
    throw new Error('Value is not a valid integer')
  }

  return n
}

/**
 * Gets the error message from an unknown error.
 *
 * @param err - The error to get the message from.
 * @returns The error message as a string.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return JSON.stringify(err)
}

/**
 * Sends an error response using FastifyReply.
 *
 * @param reply The FastifyReply object to send the response.
 * @param error The error object to be sent in the response. If it's an ApiError, the statusCode and payload are used. Otherwise, a generic 500 error is sent.
 */
export function replyError(reply: FastifyReply, error: unknown) {
  applog.errorApi(error)
  if (error instanceof ApiError) {
    reply
      .status(error.statusCode)
      .send({ success: false, error: error.getPayload() })
  } else {
    reply.status(500).send({ success: false, error: getErrorMessage(error) })
  }
}
