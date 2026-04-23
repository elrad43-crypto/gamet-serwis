'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Category = { id: string; name: string }

export function ProductFilters({
  categories,
  categoryId,
  q,
}: {
  categories: Category[]
  categoryId?: string
  q?: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(q ?? '')

  function buildUrl(updates: Record<string, string | undefined>) {
    const merged = { category: categoryId, q, ...updates }
    const params = new URLSearchParams()
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return `/admin/produkty${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="flex gap-3 mb-6">
      <select
        value={categoryId ?? ''}
        onChange={(e) => router.push(buildUrl({ category: e.target.value || undefined, q: search || undefined }))}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
      >
        <option value="">Wszystkie kategorie</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          router.push(buildUrl({ q: search || undefined }))
        }}
        className="flex gap-2 flex-1"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po nazwie lub SKU..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Szukaj
        </button>
        {(categoryId || q) && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              router.push('/admin/produkty')
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Wyczyść
          </button>
        )}
      </form>
    </div>
  )
}
