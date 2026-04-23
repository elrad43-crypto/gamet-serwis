import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json()
  const { name, slug, description } = body

  if (!name?.trim() || !slug?.trim()) {
    return Response.json({ error: 'Nazwa i slug są wymagane' }, { status: 400 })
  }

  const conflict = await prisma.category.findFirst({
    where: { slug: slug.trim(), id: { not: id } },
  })
  if (conflict) {
    return Response.json({ error: 'Kategoria z takim slugiem już istnieje' }, { status: 409 })
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
    },
    include: { _count: { select: { products: true } } },
  })

  return Response.json({ category })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const { id } = await ctx.params

  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    return Response.json(
      { error: `Nie można usunąć kategorii zawierającej ${count} produkt${count === 1 ? '' : count < 5 ? 'y' : 'ów'}` },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id } })
  return Response.json({ ok: true })
}
