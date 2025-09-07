import type { DbValue } from '#services/main.service'

import { applog } from './logger.ts'

export type FilterOperator =
  | 'exact'
  | 'iexact'
  | 'contains'
  | 'icontains'
  | 'startswith'
  | 'istartswith'
  | 'endswith'
  | 'iendswith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'range'

export interface ServiceSearchQuery {
  operator: 'and' | 'or' | 'disabled'
  conditions: {
    field: string
    operator: FilterOperator
    value: string | number
  }[]
}

export interface ServiceQuery {
  fields: string[]
  search: ServiceSearchQuery
}

export interface ServiceQueryValidator {
  fields?: boolean
  search?: boolean
  validFields?: string[]
  validSearchFields?: string[]
}

/**
 * Checks if parsing is allowed for a given field based on the validator.
 *
 * @param field - The field to check ("fields" or "search").
 * @param validator - The validation rules.
 * @returns True if parsing is allowed, false otherwise.
 */
function isParseAllowed(
  field: 'fields' | 'search',
  validator: ServiceQueryValidator,
): boolean {
  return typeof validator[field] === 'undefined' || validator[field] === true
}

export const VALID_FIELD_OPERATORS = [
  'exact',
  'iexact',
  'contains',
  'icontains',
  'startswith',
  'istartswith',
  'endswith',
  'iendswith',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'range',
]

/**
 * Parses query parameters into a structured {@link ServiceQuery} object.
 *
 * Supported query parameters:
 * - `fields`: Comma-separated list of field names. Example: `fields=name,description`
 * - `search_operator`: Logical operator for combining search conditions (`and` | `or`), default `and`.
 * - `search.{key}`: Key/value pairs for search filters. Example: `search.name=demo`
 *
 * Validation:
 * - If `fields` is disabled in the validator, the `fields` array will be empty.
 * - If `search` is disabled in the validator, the search operator will be `disabled` and conditions will be empty.
 * - `validFields`: In the result, only valid fields are shown.
 *
 * @param query - The query string to parse (e.g., `fields=name,description&search.name=demo&search.description=demo&search._operator=or`).
 * @param validator - Optional validation rules to restrict parsing.
 * @returns A structured {@link ServiceQuery} object.
 */
export default function parseQueryParams(
  query: string | Record<string, string | readonly string[]>,
  validator: ServiceQueryValidator = { fields: true, search: true },
): ServiceQuery {
  const result: ServiceQuery = {
    fields: [],
    search: {
      operator: 'and',
      conditions: [],
    },
  }

  try {
    const params = new URLSearchParams(query)

    for (const [key, value] of params.entries()) {
      // Parse `fields`
      if (key === 'fields') {
        result.fields = value
          .split(',')
          .map(f => f.trim())
          .filter(f => f !== '')
      }

      // Parse `search operator`
      else if (key === 'search_operator') {
        if (value === 'and' || value === 'or') {
          result.search.operator = value || 'and'
        }
      }

      // Parse `search`
      else if (key.startsWith('search.')) {
        const searchKey = key.split('.')[1]

        // Add operator
        const values = searchKey.split('__')
        if (values.length > 1) {
          // Obtenemos el ultimo valor que deberia ser el `operator`
          let operator: FilterOperator = values.pop() as FilterOperator
          const field = values.join('__')

          // Validamos que el operator sea un valor valido, si no es valido lo definimos como exact
          if (!VALID_FIELD_OPERATORS.includes(operator)) {
            operator = 'exact'
          }

          // Agregamos la condicion
          result.search.conditions.push({
            operator,
            field,
            value,
          })
        } else if (searchKey) {
          result.search.conditions.push({
            operator: 'exact',
            field: searchKey,
            value,
          })
        }
      }

      // ===============
      // Validators
      // Clean `fields` or `search` if method is not allowed
      // ===============

      // Validate fields
      if (!isParseAllowed('fields', validator)) {
        result.fields = []
      }

      // Validate search
      if (!isParseAllowed('search', validator)) {
        result.search = {
          operator: 'disabled',
          conditions: [],
        }
      }
    }
  } catch {
    return {
      fields: [],
      search: {
        operator: 'disabled',
        conditions: [],
      },
    }
  }

  // ================
  // Validate fields
  // ================
  if (validator?.validFields && validator.validFields.length > 0) {
    const validFieldsSet = new Set(validator.validFields)
    result.fields = result.fields.filter(f => validFieldsSet.has(f))
  }

  // ===============
  // Validate search
  // ===============
  // Remove invalid conditions based on `validSearchFields` or `validFields`
  let validSearchFields: string[] = []
  if (validator?.validSearchFields && validator.validSearchFields.length > 0) {
    validSearchFields = validator.validSearchFields
  } else if (validator?.validFields && validator.validFields.length > 0) {
    validSearchFields = validator.validFields
  }
  if (validSearchFields.length > 0) {
    const validFieldsSet = new Set(validSearchFields)
    result.search.conditions = result.search.conditions.filter(item =>
      validFieldsSet.has(item.field),
    )
  }

  // Disabled sarch if conditions is empty
  if (result.search.conditions.length === 0) {
    result.search.operator = 'disabled'
  }
  // Remove conditions if search is disabled
  if (result.search.operator === 'disabled') {
    result.search.conditions = []
  }

  console.log('========================')
  console.log('RESULT = ', JSON.stringify(result, null, 2))
  console.log('========================')
  return result
}

/**
 * Cleans a set of parameters by filtering out any keys that are not included in a list of valid parameters.
 *
 * @param params - An object containing the parameters to clean, where keys are parameter names and values are parameter values.
 * @param validParams - An array of strings representing the valid parameter names.
 * @returns A new object containing only the parameters with keys that are included in the `validParams` array.
 */
export function cleanFields(
  params: Record<string, DbValue>,
  validParams: string[],
) {
  applog.debug({ params })
  applog.debug({ validParams })
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => validParams.includes(key)),
  )
}
