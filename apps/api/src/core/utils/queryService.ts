import format from 'pg-format'

import type { DbField, DbValue } from '#services/main.service'
import { toNumberSafe } from '#utils/index'
import parseQueryParams, {
  type ServiceQuery,
  cleanFields,
  cleanServiceQuery,
} from '#utils/query'

import { applog } from './logger.ts'

export type StringOperator =
  | 'exact'
  | 'iexact'
  | 'contains'
  | 'icontains'
  | 'startswith'
  | 'istartswith'
  | 'endswith'
  | 'iendswith'

export type NumberOperator =
  | 'exact'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'range'

export interface SQL_OPERATOR {
  sql: string
  value: string | number | number[]
}

export const DEFAULT_FIELD_OPERATORS: Record<
  StringOperator,
  (field: string, value: string, index: number) => SQL_OPERATOR
> = {
  exact(field, value, index) {
    return { sql: format('%I = %s', field, `$${index}`), value }
  },
  iexact(field, value, index) {
    return { sql: format('UPPER(%I) = UPPER(%s)', field, `$${index}`), value }
  },
  contains(field, value, index) {
    return {
      sql: format('%I LIKE %s', field, `$${index}`),
      value: `%${value}%`,
    }
  },
  icontains(field, value, index) {
    return {
      sql: format('%I ILIKE %s', field, `$${index}`),
      value: `%${value}%`,
    }
  },
  startswith(field, value, index) {
    return { sql: format('%I LIKE %s', field, `$${index}`), value: `${value}%` }
  },
  istartswith(field, value, index) {
    return {
      sql: format('%I ILIKE %s', field, `$${index}`),
      value: `${value}%`,
    }
  },
  endswith(field, value, index) {
    return { sql: format('%I LIKE %s', field, `$${index}`), value: `%${value}` }
  },
  iendswith(field, value, index) {
    return {
      sql: format('%I ILIKE %s', field, `$${index}`),
      value: `%${value}`,
    }
  },
}

/**
 * Safely formats a numeric filter condition for SQL queries.
 *
 * This function ensures that the provided `value` is a valid number
 * (integer or float). If the value cannot be parsed into a valid number,
 * it will throw an error. The `field` name and `operator` are safely
 * escaped using `pg-format` to prevent SQL injection.
 *
 * @param field - The database column name to filter by.
 * @param value - The value to be compared, expected to represent a number.
 * @param operator - The SQL comparison operator (e.g., `=`, `>`, `<`, `>=`, `<=`).
 * @param index - The value to insert to the SQL, for example convert to `$1`
 *
 * @returns A SQL snippet representing the safe numeric condition.
 *
 * @throws {Error} If the `value` is not a valid number.
 */
function formatFilterNumberQuery(
  field: string,
  value: string | string[],
  operator: string,
  index: number,
): SQL_OPERATOR {
  return {
    sql: format(`%I ${operator} %s`, field, `$${index}`),
    value: toNumberSafe(value),
  }
}

export const NUMBER_FIELD_OPERATORS: Record<
  NumberOperator,
  (field: string, value: string | string[], index: number) => SQL_OPERATOR
> = {
  exact(field, value, index) {
    return formatFilterNumberQuery(field, value, '=', index)
  },
  gt(field, value, index) {
    return formatFilterNumberQuery(field, value, '>', index)
  },
  gte(field, value, index) {
    return formatFilterNumberQuery(field, value, '>=', index)
  },
  lt(field, value, index) {
    return formatFilterNumberQuery(field, value, '<', index)
  },
  lte(field, value, index) {
    return formatFilterNumberQuery(field, value, '<=', index)
  },
  in(field, value, index) {
    let valueSql: number[] = []
    if (typeof value === 'string') {
      valueSql = value
        .split(',')
        .filter(v => v.trim() !== '')
        .map(v => toNumberSafe(v))
    } else if (Array.isArray(value)) {
      valueSql = value.map(v => toNumberSafe(v))
    } else {
      throw new Error('value is not a valid type')
    }

    return {
      sql: format('%I = ANY(%s::int[])', field, `$${index}`),
      value: valueSql,
    }
  },
  range(field, value, index) {
    let valueSql: number[] = []
    if (typeof value === 'string') {
      const valueStr = value.split(',').filter(v => v.trim() !== '')
      if (valueStr.length !== 2) {
        throw new Error('value range is not available')
      }

      valueSql = valueStr.map(v => toNumberSafe(v))
    } else if (Array.isArray(value)) {
      valueSql = value.map(v => toNumberSafe(v))
    } else {
      throw new Error('value is not a valid type')
    }

    return {
      sql: format('%I BETWEEN %s AND %s', field, `$${index}`, `$${index + 1}`),
      value: valueSql,
    }
  },
}

/**
 * Builds a safe, parameterized SQL query from user-provided query parameters.
 *
 * This function parses raw query parameters (from an API request, for example)
 * and constructs a SQL `SELECT` statement with optional `WHERE` conditions.
 * Only fields defined in `dbFields` are considered valid, and values are
 * safely parameterized to prevent SQL injection.
 *
 * ### Features:
 * - Dynamically selects only valid fields defined in `dbFields`.
 * - Supports conditional filters (`exact`, `gt`, `gte`, `lt`, `lte`, `contains`, `icontains`, etc.).
 * - Handles both numeric and string operators safely.
 * - Automatically generates `$1`, `$2`, ... placeholders for query values.
 * - Supports logical operators `AND` / `OR` (default: `AND`).
 * - Skips invalid fields or unparsable values silently (they are not included in the query).
 *
 * ### Example:
 * ```ts
 * const result = getQuery(
 *   { fields: 'id,name', search: { name__icontains: 'foo', id__gte: '10' } },
 *   [{ key: 'id', type: 'number' }, { key: 'name', type: 'string' }],
 *   'users'
 * )
 *
 * // result.sql =>
 * // "SELECT id,name FROM users WHERE name ILIKE $1 AND id >= $2"
 *
 * // result.values =>
 * // ["%foo%", 10]
 * ```
 *
 * @param query - Raw query parameters (string or object) to be parsed into fields and filters.
 * @param dbFields - List of valid database fields (with `key` and `type`) allowed in the query.
 * @param tableName - Name of the database table to query from.
 *
 * @returns An object containing:
 * - `sql`: A parameterized SQL query string.
 * - `values`: An array of parameter values (`string | number`) for placeholders.
 */
export function getQuery(
  query: string | Record<string, string | readonly string[]>,
  dbFields: DbField[],
  tableName: string,
) {
  // Get parsedData with `fields` and `search`
  const parsedQuery = parseQueryParams(query, {
    validFields: dbFields.map(f => f.key),
  })

  return getQueryFromServiceQuery(parsedQuery, dbFields, tableName)
}

/**
 * Builds a parameterized SQL query (`SELECT ... FROM ... WHERE ...`) from a `ServiceQuery` object.
 *
 * This function:
 * - Cleans and validates the given `serviceQuery` against the available database fields.
 * - Generates a `SELECT` statement including only valid fields.
 * - Dynamically builds a `WHERE` clause based on search conditions and operators.
 * - Returns the SQL string along with the corresponding parameter values for safe execution.
 *
 * @param serviceQuery - The query definition provided by the service layer, including fields and search conditions.
 * @param dbFields - The list of available database fields with metadata (`key`, `type`, etc.).
 * @param tableName - The database table name to run the query against.
 *
 * @returns An object containing:
 * - `sql`: The generated SQL query string.
 * - `values`: An array of parameter values to be used with the query.
 *
 * @example
 * ```ts
 * const serviceQuery: ServiceQuery = {
 *   fields: ['id', 'name'],
 *   search: {
 *     operator: 'and',
 *     conditions: [
 *       { field: 'id', operator: 'gt', value: 10 },
 *       { field: 'name', operator: 'contains', value: 'John' }
 *     ]
 *   }
 * }
 *
 * const dbFields: DbField[] = [
 *   { key: 'id', type: 'number' },
 *   { key: 'name', type: 'string' },
 *   { key: 'email', type: 'string' }
 * ]
 *
 * const result = getQueryFromServiceQuery(serviceQuery, dbFields, 'users');
 *
 * // result.sql ->
 * // "SELECT id, name FROM users WHERE id > $1 AND name ILIKE $2"
 *
 * // result.values ->
 * // [10, '%John%']
 * ```
 */
export function getQueryFromServiceQuery(
  serviceQuery: ServiceQuery,
  dbFields: DbField[],
  tableName: string,
) {
  // First clean serviceQuery
  cleanServiceQuery(serviceQuery, {
    validFields: dbFields.map(f => f.key),
  })

  // If there are no fields, return all available dbFields
  let fields = serviceQuery.fields
  if (fields.length === 0) {
    fields = dbFields.map(f => f.key)
  }

  let dbQuery = format('SELECT %I FROM %I', fields, tableName)
  const dbQueryValues: (string | number | number[])[] = []

  // Add WHERE clause if query has search fields
  if (serviceQuery.search.operator !== 'disabled') {
    const conditions = serviceQuery.search.conditions
      .map(item => {
        // Verificamos que el `search field` sea valido con los `dbFields`
        const dbField = dbFields.find(f => f.key === item.field)

        if (!dbField) {
          return ''
        }

        const operator = item.operator as StringOperator | NumberOperator
        const value = String(item.value).trim()

        // Add operator to number
        if (dbField?.type === 'number') {
          // Transformamos el operator string al operator para la base de datos
          // Por ejemplo:
          // - `exact` se transforma a `=`
          // - `gt` se transforma a `>`
          const operatorFn = NUMBER_FIELD_OPERATORS[operator as NumberOperator]
          if (operatorFn && typeof operatorFn === 'function') {
            try {
              const data = operatorFn(
                item.field,
                value,
                dbQueryValues.length + 1,
              )

              if (operator === 'range') {
                dbQueryValues.push((data.value as number[])[0])
                dbQueryValues.push((data.value as number[])[1])
              } else {
                dbQueryValues.push(data.value)
              }

              return data.sql
            } catch (error) {
              return ''
            }
          }
        } else {
          const operatorFn = DEFAULT_FIELD_OPERATORS[operator as StringOperator]
          if (operatorFn && typeof operatorFn === 'function') {
            const data = operatorFn(item.field, value, dbQueryValues.length + 1)
            dbQueryValues.push(data.value)
            return data.sql
          }
        }

        return ''
      })
      .filter(v => v.trim() !== '')

    // Add condition based on `serviceQuery` search operator
    const whereClause = conditions.join(
      serviceQuery.search.operator === 'or' ? ' OR ' : ' AND ',
    )

    // Add WHERE clause
    dbQuery = `${dbQuery} WHERE ${whereClause}`
  }

  console.log('QUERY = ', dbQuery)
  console.log('VALUES = ', dbQueryValues)

  return {
    sql: dbQuery,
    values: dbQueryValues,
  }
}

/**
 * Generates an SQL INSERT query and its corresponding values.
 *
 * @param params - An object containing the data to be inserted into the database.  The keys of the object represent the column names, and the values represent the data to be inserted.
 * @param dbFields - An array of `DbField` objects representing the database table's schema. Each `DbField` should have a `key` property representing the column name.
 * @param tableName - The name of the database table to insert data into.
 * @returns An object containing the generated SQL query string (`sql`) and an array of values (`values`) to be used with the query. The query includes a `RETURNING *` clause to return all columns of the inserted row.
 */
export function getInsertQuery(
  params: Record<string, DbValue>,
  dbFields: DbField[],
  tableName: string,
) {
  const validParams = cleanFields(
    params,
    dbFields.map(f => f.key),
  )
  const fields = Object.keys(validParams)
  const values = fields.map(f => validParams[f])
  const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ')
  const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`

  applog.debug({ query })
  applog.debug({ values })

  return {
    sql: query,
    values,
  }
}
