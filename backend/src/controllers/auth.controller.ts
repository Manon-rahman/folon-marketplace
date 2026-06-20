import type { RequestHandler } from 'express'
import { AuthService } from '../services/auth.service'
import { ok, fail } from '../types'

const authService = new AuthService()
const COOKIE_NAME = 'refreshToken'
const COOKIE_OPTS = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, maxAge: 7 * 24 * 60 * 60 * 1000 }

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string }
    const result = await authService.register(email, password, name)
    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTS)
    ok(res, { accessToken: result.accessToken, user: result.user }, 201)
  } catch (err: unknown) {
    const e = err as { code?: string; message: string }
    if (e.code === 'EMAIL_TAKEN') return fail(res, 'EMAIL_TAKEN', e.message)
    next(err)
  }
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string }
    const result = await authService.login(email, password)
    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTS)
    ok(res, { accessToken: result.accessToken, user: result.user })
  } catch (err: unknown) {
    const e = err as { code?: string; message: string }
    if (e.code === 'INVALID_CREDENTIALS') return fail(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401)
    next(err)
  }
}

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined
    if (!token) return fail(res, 'MISSING_TOKEN', 'No refresh token', 401)
    const result = await authService.refresh(token)
    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTS)
    ok(res, { accessToken: result.accessToken, user: result.user })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'INVALID_REFRESH') return fail(res, 'INVALID_REFRESH', 'Refresh token invalid or expired', 401)
    next(err)
  }
}

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined
    if (token) await authService.logout(token)
    res.clearCookie(COOKIE_NAME)
    ok(res, { message: 'Logged out' })
  } catch (err) {
    next(err)
  }
}
