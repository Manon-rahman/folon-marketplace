import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface JwtPayload {
  id: string
  email: string
  role: 'user' | 'admin'
}

export const authGuard: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } })
    return
  }
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    next()
  } catch {
    res.status(401).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token invalid or expired' } })
  }
}

export const adminGuard: RequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } })
    return
  }
  next()
}
