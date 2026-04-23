import { prisma } from '@/lib/prisma'
import { SklepClient } from './sklep-client'

export const metadata = {
  title: 'Sklep z częściami — Serwis Sprzętu Ratowniczego',
  description: 'Oryginalne części i akcesoria do sprzętu ratowniczego: lampy, głośniki, generatory, syreny.',
}

export default async function SklepPage() {
  const [rawProducts, rawCategories] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
  ])

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    price: p.price !== null ? parseFloat(p.price.toString()) : null,
    imageUrl: p.imageUrl,
    inStock: p.inStock,
    category: p.category,
  }))

  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }))

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sklep z częściami</h1>
        <p className="text-gray-500 mt-2">
          Oryginalne części i akcesoria do sprzętu ratowniczego
        </p>
      </div>

      <SklepClient products={products} categories={categories} />
    </div>
  )
}
