import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category') || undefined
  const q = searchParams.get('q') || undefined

  const products = await prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  return Response.json({
    products: products.map((p: (typeof products)[number]) => ({
      ...p,
      price: p.price !== null ? parseFloat(p.price.toString()) : null,
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })

  const body = await request.json()
  const { name, slug, description, sku, brand, price, imageUrl, inStock, categoryId } = body

  if (!name?.trim() || !slug?.trim() || !description?.trim() || !categoryId) {
    return Response.json({ error: 'Brakujące wymagane pola: nazwa, slug, opis, kategoria' }, { status: 400 })
  }

  const priceNum = price !== null && price !== undefined ? parseFloat(String(price)) : null
  if (priceNum !== null && (isNaN(priceNum) || priceNum <= 0)) {
    return Response.json({ error: 'Cena musi być liczbą większą od 0' }, { status: 400 })
  }

  const existing = await prisma.product.findUnique({ where: { slug: slug.trim() } })
  if (existing) {
    return Response.json({ error: 'Produkt z takim slugiem już istnieje' }, { status: 409 })
  }

  const product = await prisma.product.create({
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

  return Response.json(
    { product: { ...product, price: product.price ? parseFloat(product.price.toString()) : null } },
    { status: 201 }
  )
}
