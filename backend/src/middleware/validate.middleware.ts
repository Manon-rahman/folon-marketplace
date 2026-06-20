import type { RequestHandler } from 'express'
import type { ZodSchema } from 'zod'

export const validate = (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION', message: result.error.format() },
      })
      return
    }
    req.body = result.data
    next()
  }
