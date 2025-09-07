export const API_ERROR_CODES = {
  AUTH_REGISTER_ALL_FIELDS_REQUIRED: {
    message: 'All fields are required for registration',
  },
  AUTH_REGISTER_PASSWORD: {
    message: 'Password must be at least 8 characters long',
  },
  AUTH_USER_ALREADY_EXISTS: {
    message: 'User already exist',
  },
} as const

export type ApiErrorCode = keyof typeof API_ERROR_CODES

export class ApiError extends Error {
  statusCode: number
  code: ApiErrorCode | 'UNKNOWN_ERROR'

  constructor(code: ApiErrorCode, statusCode = 400) {
    const error = API_ERROR_CODES[code]
    const message = error ? error.message : 'Unknown error'
    super(message)

    this.code = code || 'UNKNOWN_ERROR'
    this.statusCode = statusCode

    Object.setPrototypeOf(this, ApiError.prototype)
  }

  getPayload() {
    return {
      code: this.code,
      message: this.message,
    }
  }
}
