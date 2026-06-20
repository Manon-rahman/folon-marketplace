import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.middleware'
import { register, login, refresh, logout } from '../controllers/auth.controller'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router
