import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Endpoint jednorazowy do stworzenia pierwszego admina
// Po u�yciu mo�na go usun�� lub zabezpieczy�
export async function POST(request: Request) {
  const body = await request.json()
  const { email, password, name, secret } = body

  if (secret !== process.env.SEED_SECRET) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'U�ytkownik ju� istnieje' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.adminUser.create({
    data: { email, password: hashed, name },
  })

  return Response.json({ id: user.id, email: user.email, name: user.name })
}
