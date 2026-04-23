import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json()
  const { name, slug, description, sku, brand, price, imageUrl, inStock, categoryId } = body

  if (!name?.trim() || !slug?.trim() || !description?.trim() || !categoryId) {
    return Response.json({ error: 'Brakujące wymagane pola' }, { status: 400 })
  }

  const priceNum = price !== null && price !== undefined ? parseFloat(String(price)) : null
  if (priceNum !== null && (isNaN(priceNum) || priceNum <= 0)) {
    return Response.json({ error: 'Cena musi być liczbą większą od 0' }, { status: 400 })
  }

  const conflict = await prisma.product.findFirst({
    where: { slug: slug.trim(), id: { not: id } },
  })
  if (conflict) {
    return Response.json({ error: 'Produkt z takim slugiem już istnieje' }, { status: 409 })
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      sku: sku?.trim() || null,
      brand: brand?.trim() || null,
      price: priceNum !== null ? String(priceNum) : null,
      imageUrl: imageUrl?.trim() || null,
      inStock: inStock ?? true,
      categoryId,
    },
  })

  return Response.json({
    product: { ...product, price: product.price ? parseFloat(product.price.toString()) : null },
  })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const { id } = await ctx.params
  await prisma.product.delete({ where: { id } })
  return Response.json({ ok: true })
}
