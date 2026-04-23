import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductForm } from '../../product-form'

export default async function EdytujProduktPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!product) notFound()

  const defaultValues = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    sku: product.sku ?? '',
    brand: product.brand ?? '',
    price: product.price !== null ? parseFloat(product.price.toString()).toString() : '',
    imageUrl: product.imageUrl ?? '',
    inStock: product.inStock,
    categoryId: product.categoryId,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/produkty" className="text-red-600 hover:underline text-sm">
          ← Powrót do listy
        </Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Edytuj produkt</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm categories={categories} defaultValues={defaultValues} />
      </div>
    </div>
  )
}
