import { prisma } from '@/lib/prisma'
import { KategorieClient } from './kategorie-client'

export default async function KategoriePage() {
  const raw = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  const categories = raw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    productCount: c._count.products,
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <KategorieClient initialCategories={categories} />
    </div>
  )
}
