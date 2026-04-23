import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ProductForm } from '../product-form'

export default async function NowyProduktPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/produkty" className="text-red-600 hover:underline text-sm">
          ← Powrót do listy
        </Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Nowy produkt</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
