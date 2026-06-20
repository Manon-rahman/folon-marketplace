import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  console.log('[login] DB:', process.env.DATABASE_URL?.slice(0, 50))
  console.log('[login] email:', parsed.data.email)

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } })
  console.log('[login] admin found:', !!admin, admin?.email)

  if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash)
  console.log('[login] password valid:', valid)

  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const session = await getSession()
  session.adminId = admin.id
  session.adminEmail = admin.email
  await session.save()

  return NextResponse.json({ ok: true })
}
