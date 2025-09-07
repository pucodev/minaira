import type fastifyPostgres from '@fastify/postgres'
import type { Pool } from 'pg'

import { getInsertQuery, getQuery } from '#utils/queryService'

export interface DbField {
  key: string
  type: 'string' | 'number' | 'boolean'
}

export type DbValue = any

export type DbService =
  | Pool
  | (fastifyPostgres.PostgresDb & Record<string, fastifyPostgres.PostgresDb>)

export class MainService {
  public tableName: string
  public dbFields: DbField[]
  public db: DbService

  constructor(db: DbService, tableName: string, dbFields: DbField[]) {
    this.tableName = tableName
    this.dbFields = dbFields
    this.db = db
  }

  async query(query: string | Record<string, string | readonly string[]>) {
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
}
