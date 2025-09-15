export const API_ERROR_CODES = {
  // AUTH REGISTER
  AUTH_REGISTER_ALL_FIELDS_REQUIRED: {
    message: 'All fields are required for registration',
    statusCode: 422,
  },
  AUTH_REGISTER_PASSWORD: {
    message: 'Password must be at least 8 characters long',
    statusCode: 422,
  },
  AUTH_USER_ALREADY_EXISTS: {
    message: 'User already exist',
    statusCode: 409,
  },
  AUTH_REGISTER_NO_SECRET_TOKEN: {
    message: 'Please add `AUTH_SECRET_TOKEN` to environments variables',
    statusCode: 500,
  },

  // AUTH LOGIN
  AUTH_LOGIN_ALL_FIELDS_REQUIRED: {
    message: 'email and password are required',
    statusCode: 422,
  },
  AUTH_LOGIN_INVALID: {
    message: 'email or password are invalid',
    statusCode: 403,
  },

  // AUTH TOKEN
  AUTH_TOKEN_INVALID: {
    message: 'invalid token, please login again',
    statusCode: 403,
  },
  AUTH_TOKEN_NO_SECRET_TOKEN: {
    message: 'Please add `AUTH_SECRET_TOKEN` to environments variables',
    statusCode: 500,
  },
  AUTH_TOKEN_EXPIRED: {
    message: 'Token expired, please login again',
    statusCode: 403,
  },
  AUTH_TOKEN_ERROR: {
    message: 'Invalid code, please login again',
    statusCode: 403,
  },
  AUTH_TOKEN_UNKNOWN: {
    message: 'Invalid code, please login again',
    statusCode: 403,
  },

  // COMPANIES
  COMPANIES_NO_USER: {
    message: 'Please send a user id',
    statusCode: 400,
  },
  COMPANIES_CREATE_ALL_FIELDS_REQUIRED: {
    message: 'All fields are required',
    statusCode: 422,
  },
  COMPANIES_SLUG_ALREADY_EXIST: {
    message: 'company slug already exist',
    statusCode: 422,
  },

  // LOCATIONS
  LOCATIONS_NO_USER_COMPANY: {
    message: 'Please send company_id and user_id',
    statusCode: 422,
  },
  LOCATIONS_UNAUTHORIZED_COMPANY: {
    message: 'Company does not exist',
    statusCode: 422,
  },
} as const

export type ApiErrorCode = keyof typeof API_ERROR_CODES

export class ApiError extends Error {
  statusCode: number
  code: ApiErrorCode | 'UNKNOWN_ERROR'

  constructor(code: ApiErrorCode, statusCode?: number) {
    const error = API_ERROR_CODES[code]
    const message = error ? error.message : 'Unknown error'
    super(message)

    this.code = code || 'UNKNOWN_ERROR'
    this.statusCode = statusCode || error.statusCode || 400

    Object.setPrototypeOf(this, ApiError.prototype)
  }

  getPayload() {
    return {
      code: this.code,
      message: this.message,
    }
  }
}
