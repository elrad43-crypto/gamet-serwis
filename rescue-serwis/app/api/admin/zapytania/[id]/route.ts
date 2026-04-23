import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json()
  const { status, notes } = body

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
    },
  })

  return Response.json({ inquiry })
}
