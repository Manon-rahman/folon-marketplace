import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.middleware'
import { createOrder, getOrder } from '../controllers/order.controller'

const router = Router()

const addressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2),
})

const createOrderSchema = z.object({
  email: z.string().email(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['stripe', 'cod']).default('stripe'),
})

router.post('/', validate(createOrderSchema), createOrder)
router.get('/:id', getOrder)

export default router
