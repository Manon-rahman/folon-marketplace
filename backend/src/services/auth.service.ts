import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { AuthRepository } from '../repositories/auth.repository'
import { env } from '../config/env'
import type { User } from '../types'

const repo = new AuthRepository()
const SALT_ROUNDS = 12
const ACCESS_TTL = '15m'
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

function signAccess(user: User) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: ACCESS_TTL })
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existing = await repo.findByEmail(email)
    if (existing) throw Object.assign(new Error('Email already registered'), { code: 'EMAIL_TAKEN' })

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await repo.create(email, passwordHash, name)
    return this._issueTokens(user)
  }

  async login(email: string, password: string) {
    const user = await repo.findByEmail(email)
    if (!user) throw Object.assign(new Error('Invalid credentials'), { code: 'INVALID_CREDENTIALS' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw Object.assign(new Error('Invalid credentials'), { code: 'INVALID_CREDENTIALS' })

    const { passwordHash: _omit, ...safeUser } = user
    return this._issueTokens(safeUser)
  }

  async refresh(rawRefreshToken: string) {
    const hash = hashToken(rawRefreshToken)
    const stored = await repo.findRefreshToken(hash)
    if (!stored || stored.expiresAt < new Date()) {
      throw Object.assign(new Error('Invalid refresh token'), { code: 'INVALID_REFRESH' })
    }
    const user = await repo.findById(stored.userId)
    if (!user) throw Object.assign(new Error('User not found'), { code: 'NOT_FOUND' })

    await repo.deleteRefreshToken(hash)
    return this._issueTokens(user)
  }

  async logout(rawRefreshToken: string) {
    const hash = hashToken(rawRefreshToken)
    await repo.deleteRefreshToken(hash)
  }

  private async _issueTokens(user: User) {
    const accessToken = signAccess(user)
    const rawRefresh = crypto.randomBytes(48).toString('hex')
    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS)
    await repo.saveRefreshToken(user.id, hashToken(rawRefresh), expiresAt)
    return { accessToken, refreshToken: rawRefresh, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  }
}
