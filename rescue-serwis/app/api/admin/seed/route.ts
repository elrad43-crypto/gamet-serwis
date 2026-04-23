import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Endpoint do jednorazowego utworzenia pierwszego admina
// Zabezpieczony kluczem z .env
export async function POST(request: NextRequest) {
  const seedKey = request.headers.get('x-seed-key')

  if (!seedKey || seedKey !== process.env.SEED_SECRET_KEY) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const body = await request.json()
  const { email, password, name, role } = body

  if (!email || !password || !name) {
    return Response.json({ error: 'Brakujące dane' }, { status: 400 })
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'Użytkownik już istnieje' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.adminUser.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role === 'ADMIN' ? 'ADMIN' : 'TECHNICIAN',
    },
  })

  return Response.json(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    { status: 201 }
  )
}
