'use client'
import Link from 'next/link'
import { useState } from 'react'

const CATEGORY_ICONS: Record<string, string> = {
  'lampy-ostrzegawcze': '🔦',
  'glosniki-i-naglosnienie': '🔊',
  'generatory': '⚡',
  'syreny-i-sygnalizatory': '🚨',
}

type Category = {
  id: string
  name: string
  slug: string
  productCount: number
}

type Product = {
  id: string
  name: string
  slug: string
  brand: string | null
  price: number | null
  imageUrl: string | null
  inStock: boolean
  category: { id: string; name: string; slug: string }
}

function ProductCard({ p }: { p: Product }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-red-300 hover:shadow-sm transition-all flex flex-col ${!p.inStock ? 'opacity-70' : ''}`}>
      <div className="h-44 bg-gray-100 flex items-center justify-center text-5xl relative">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          '📦'
        )}
        {!p.inStock && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <span className="bg-gray-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Niedostępny
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{p.category.name}</p>
        <p className="font-semibold text-gray-900 leading-tight mb-1 flex-1">{p.name}</p>
        {p.brand && <p className="text-xs text-gray-500 mb-2">{p.brand}</p>}
        <div className="flex items-center justify-between mt-3">
          <div>
            {p.price !== null ? (
              <span className="text-lg font-bold text-red-600">
                {p.price.toFixed(2)} zł
              </span>
            ) : (
              <span className="text-sm text-gray-400">Cena na zapytanie</span>
            )}
          </div>
          {p.inStock && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Dostępny
            </span>
          )}
        </div>
        <Link
          href={`/sklep/${p.slug}`}
          className="mt-3 block text-center border border-gray-300 hover:border-red-400 hover:text-red-600 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Szczegóły
        </Link>
      </div>
    </div>
  )
}

export function SklepClient({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = selectedId ? products.filter((p) => p.category.id === selectedId) : products

  return (
    <>
      {/* Karty kategorii */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <button
          onClick={() => setSelectedId(null)}
          className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
            selectedId === null
              ? 'border-red-400 bg-red-50 ring-1 ring-red-400'
              : 'border-gray-200 bg-white hover:border-red-300'
          }`}
        >
          <div className="text-2xl mb-2">🛒</div>
          <div className="font-semibold text-gray-900 text-sm">Wszystkie</div>
          <div className="text-xs text-gray-400 mt-0.5">{products.length} produktów</div>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedId(selectedId === cat.id ? null : cat.id)}
            className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
              selectedId === cat.id
                ? 'border-red-400 bg-red-50 ring-1 ring-red-400'
                : 'border-gray-200 bg-white hover:border-red-300'
            }`}
          >
            <div className="text-2xl mb-2">{CATEGORY_ICONS[cat.slug] ?? '📦'}</div>
            <div className="font-semibold text-gray-900 text-sm">{cat.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{cat.productCount} produktów</div>
          </button>
        ))}
      </div>

      {/* Siatka produktów */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Brak produktów w tej kategorii</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </>
  )
}
