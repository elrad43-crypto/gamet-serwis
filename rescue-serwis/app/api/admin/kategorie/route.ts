import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return Response.json({ categories })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const body = await request.json()
  const { name, slug, description } = body

  if (!name?.trim() || !slug?.trim()) {
    return Response.json({ error: 'Nazwa i slug są wymagane' }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { slug: slug.trim() } })
  if (existing) {
    return Response.json({ error: 'Kategoria z takim slugiem już istnieje' }, { status: 409 })
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
    },
    include: { _count: { select: { products: true } } },
  })

  return Response.json({ category }, { status: 201 })
}
