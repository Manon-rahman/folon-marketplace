import { pool } from '../db/pool'
import type { User } from '../types'

interface UserRow {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  password_hash: string
  created_at: Date
  updated_at: Date
}

export class AuthRepository {
  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT id, email, name, role, password_hash, created_at, updated_at
       FROM users WHERE email = $1`,
      [email],
    )
    if (!rows[0]) return null
    const r = rows[0]
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role,
      passwordHash: r.password_hash,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1`,
      [id],
    )
    if (!rows[0]) return null
    const r = rows[0]
    return { id: r.id, email: r.email, name: r.name, role: r.role, createdAt: r.created_at, updatedAt: r.updated_at }
  }

  async create(email: string, passwordHash: string, name: string): Promise<User> {
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users(email, password_hash, name) VALUES($1, $2, $3)
       RETURNING id, email, name, role, created_at, updated_at`,
      [email, passwordHash, name],
    )
    const r = rows[0]
    return { id: r.id, email: r.email, name: r.name, role: r.role, createdAt: r.created_at, updatedAt: r.updated_at }
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `INSERT INTO refresh_tokens(user_id, token_hash, expires_at) VALUES($1, $2, $3)`,
      [userId, tokenHash, expiresAt],
    )
  }

  async findRefreshToken(tokenHash: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const { rows } = await pool.query<{ user_id: string; expires_at: Date }>(
      `SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash],
    )
    if (!rows[0]) return null
    return { userId: rows[0].user_id, expiresAt: rows[0].expires_at }
  }

  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [tokenHash])
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId])
  }
}
