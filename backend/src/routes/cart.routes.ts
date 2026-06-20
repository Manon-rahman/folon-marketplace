import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.middleware'
import { validateCart } from '../controllers/cart.controller'

const router = Router()

const validateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
})

router.post('/validate', validate(validateSchema), validateCart)

export default router
