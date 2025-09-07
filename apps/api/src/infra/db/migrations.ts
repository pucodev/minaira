import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import { fileURLToPath } from 'url'

import { getDbConfig } from './connection.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIGRATION_FOLDER = path.join(__dirname, 'migrations')
const MIGRATION_ALWAYS_FOLDER = path.join(__dirname, 'migrations-always')

/**
 * Get PG client from db config
 *
 * @returns - pgclient
 */
function getClient() {
  return new Client(getDbConfig())
}

/**
 * Run migrations for each sql file in this folder
 */
async function runMigrations(): Promise<void> {
  const client = getClient()
  await client.connect()

  // Create `migrations` table
  // This table is used to track migrations.
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      run_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Reads all `.sql` files in the current directory.
  const files: string[] = fs
    .readdirSync(MIGRATION_FOLDER)
    .filter((file): file is string => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    // If migration is already in database, move on.
    const { rows } = await client.query(
      'SELECT * FROM migrations WHERE name = $1',
      [file],
    )

    if (rows.length === 0) {
      const sql = fs.readFileSync(path.join(MIGRATION_FOLDER, file), 'utf8')
      console.log(`Running migration: ${file}`)
      await client.query(sql)
      // Save migration to the DB
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [file])
    } else {
      console.log(`Skipping already run migration: ${file}`)
    }
  }

  await client.end()
  console.log('✅ All migrations complete')
}

/**
 * Runs all SQL migration files located in the `migrations-always` folder.
 * These migrations are executed every time the migrations run.
 *
 * @async
 * @returns - A promise that resolves when all migrations have been successfully executed.
 */
async function runAlwaysMigrations(): Promise<void> {
  const client = getClient()
  await client.connect()

  // Reads all `.sql` files in the current directory.
  const files: string[] = fs
    .readdirSync(MIGRATION_ALWAYS_FOLDER)
    .filter((file): file is string => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(
      path.join(MIGRATION_ALWAYS_FOLDER, file),
      'utf8',
    )
    console.log(`Running always migration: ${file}`)
    await client.query(sql)
  }

  await client.end()
  console.log('✅ All always migrations complete')
}

/**
 * Executes database migrations and always migrations.
 * Handles errors and exits the process if any migration fails.
 */
async function main() {
  try {
    try {
      await runMigrations()
      console.log('✅ Migrations completed')
    } catch (err: unknown) {
      console.error('❌ runMigrations failed:', err)
      process.exit(1) // Salir si falla
    }

    try {
      await runAlwaysMigrations()
      console.log('✅ Always migrations completed')
    } catch (err: unknown) {
      console.error('❌ runAlwaysMigrations failed:', err)
      process.exit(1) // Salir si falla
    }
  } catch (err: unknown) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

main()
