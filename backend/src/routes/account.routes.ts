import { Router } from 'express'
import { authGuard } from '../middleware/auth.middleware'
import { getMyOrders } from '../controllers/account.controller'

const router = Router()

router.get('/orders', authGuard, getMyOrders)

export default router
