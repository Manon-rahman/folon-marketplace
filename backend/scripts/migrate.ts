import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id     SERIAL PRIMARY KEY,
      name   TEXT UNIQUE NOT NULL,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const { rows } = await pool.query<{ name: string }>('SELECT name FROM _migrations ORDER BY name')
  const ran = new Set(rows.map((r) => r.name))

  const dir = path.resolve(__dirname, '../../db/migrations')
  if (!fs.existsSync(dir)) {
    console.log('No migrations directory found, skipping.')
    await pool.end()
    return
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    if (ran.has(file)) {
      console.log(`  skip  ${file}`)
      continue
    }
    console.log(`  run   ${file}`)
    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    await pool.query('BEGIN')
    try {
      await pool.query(sql)
      await pool.query('INSERT INTO _migrations(name) VALUES($1)', [file])
      await pool.query('COMMIT')
    } catch (e) {
      await pool.query('ROLLBACK')
      throw e
    }
  }

  console.log('Migrations complete.')
  await pool.end()
}

migrate().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
