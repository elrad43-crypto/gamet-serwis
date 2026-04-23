import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { InquiryForm } from './inquiry-form'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { name: true } } },
  })
  if (!product) return { title: 'Produkt nie znaleziony' }

  return {
    title: `${product.name} — Sklep Serwis Ratowniczy`,
    description:
      product.description?.slice(0, 160) ??
      `${product.name} — ${product.category.name}. Sklep z częściami do sprzętu ratowniczego.`,
  }
}

export default async function ProduktPage({ params }: Props) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product) notFound()

  const similar = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 3,
    orderBy: { name: 'asc' },
    include: { category: { select: { id: true, name: true, slug: true } } },
  })

  const price = product.price !== null ? parseFloat(product.price.toString()) : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/sklep" className="hover:text-red-600 transition-colors">Sklep</Link>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      {/* Główna sekcja */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
        {/* Zdjęcie */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden aspect-square flex items-center justify-center">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl">📦</span>
          )}
        </div>

        {/* Informacje */}
        <div className="flex flex-col">
          <div className="mb-1">
            <Link
              href={`/sklep?category=${product.categoryId}`}
              className="text-sm text-red-600 hover:underline"
            >
              {product.category.name}
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {product.brand && (
            <p className="text-gray-500 mb-1">
              <span className="font-medium text-gray-700">Marka:</span> {product.brand}
            </p>
          )}
          {product.sku && (
            <p className="text-gray-500 mb-4 font-mono text-sm">
              <span className="font-medium text-gray-700 font-sans">SKU:</span> {product.sku}
            </p>
          )}

          <div className="flex items-center gap-3 mb-6">
            {price !== null ? (
              <span className="text-3xl font-bold text-red-600">{price.toFixed(2)} zł</span>
            ) : (
              <span className="text-xl text-gray-400">Cena na zapytanie</span>
            )}
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                product.inStock
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {product.inStock ? 'Dostępny' : 'Niedostępny'}
            </span>
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-8 flex-1">{product.description}</p>
          )}

          <InquiryForm
            productId={product.id}
            productName={product.name}
            inStock={product.inStock}
          />

          <p className="text-xs text-gray-400 text-center mt-3">
            Skontaktujemy się z Tobą w ciągu 24 godzin
          </p>
        </div>
      </div>

      {/* Podobne produkty */}
      {similar.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Podobne produkty z kategorii {product.category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {similar.map((p) => {
              const simPrice = p.price !== null ? parseFloat(p.price.toString()) : null
              return (
                <Link
                  key={p.id}
                  href={`/sklep/${p.slug}`}
                  className="bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all overflow-hidden group"
                >
                  <div className="h-36 bg-gray-100 flex items-center justify-center text-4xl">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-red-600 transition-colors line-clamp-2">
                      {p.name}
                    </p>
                    {simPrice !== null && (
                      <p className="text-red-600 font-bold mt-1 text-sm">
                        {simPrice.toFixed(2)} zł
                      </p>
                    )}
                    <span
                      className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {p.inStock ? 'Dostępny' : 'Niedostępny'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
