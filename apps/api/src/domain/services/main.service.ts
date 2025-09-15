// import type fastifyPostgres from '@fastify/postgres'
// import type { Pool, QueryResultRow } from 'pg'
import type { PostgresDb } from '@fastify/postgres'
import type { PoolClient, QueryResultRow } from 'pg'

import type { ServiceQuery } from '#utils/query'
import {
  Point,
  getInsertQuery,
  getQuery,
  getQueryFromServiceQuery,
} from '#utils/queryService'

export interface DbField {
  key: string
  type: 'string' | 'number' | 'boolean' | 'Point'
}

// FIXME: Set avilable types
export type DbValue = any | Point

export type DbService = PostgresDb
// | Pool
// | (fastifyPostgres.PostgresDb & Record<string, fastifyPostgres.PostgresDb>)

export class MainService<Node extends QueryResultRow> {
  public tableName: string
  public dbFields: DbField[]
  public db: DbService

  constructor(db: DbService, tableName: string, dbFields: DbField[]) {
    this.tableName = tableName
    this.dbFields = dbFields
    this.db = db
  }

  async queryFromServiceQuery(serviceQuery: ServiceQuery): Promise<Node[]> {
    const data = getQueryFromServiceQuery(
      serviceQuery,
      this.dbFields,
      this.tableName,
    )

    const response = await this.db.query<Node>(data.sql, data.values)
    return response.rows
  }

  async queryFromString(
    query: string | Record<string, string | readonly string[]>,
  ) {
    const data = getQuery(query, this.dbFields, this.tableName)
    return await this.db.query(data.sql, data.values)
  }

  async insert<Node extends Record<string, DbValue>>(
    params: Node,
  ): Promise<Node> {
    const data = getInsertQuery(params, this.dbFields, this.tableName)
    const response = await this.db.query(data.sql, data.values)
    return response.rows[0] || {}
  }

  async insertTransact<Node extends Record<string, DbValue>>(
    params: Node,
    client: PoolClient,
  ): Promise<Node> {
    const data = getInsertQuery(params, this.dbFields, this.tableName)
    const response = await client.query(data.sql, data.values)
    return response.rows[0] || {}
  }
}
