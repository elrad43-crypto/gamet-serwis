'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type Category = { id: string; name: string }

export type ProductFormValues = {
  id?: string
  name?: string
  slug?: string
  description?: string
  sku?: string
  brand?: string
  price?: string
  imageUrl?: string
  inStock?: boolean
  categoryId?: string
}

export function ProductForm({
  categories,
  defaultValues,
}: {
  categories: Category[]
  defaultValues?: ProductFormValues
}) {
  const router = useRouter()
  const isEdit = !!defaultValues?.id

  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [slugLocked, setSlugLocked] = useState(isEdit)
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [sku, setSku] = useState(defaultValues?.sku ?? '')
  const [brand, setBrand] = useState(defaultValues?.brand ?? '')
  const [price, setPrice] = useState(defaultValues?.price ?? '')
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? '')
  const [inStock, setInStock] = useState(defaultValues?.inStock ?? true)
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slugLocked) setSlug(toSlug(name))
  }, [name, slugLocked])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(
      isEdit ? `/api/admin/produkty/${defaultValues!.id}` : '/api/admin/produkty',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          sku: sku.trim() || null,
          brand: brand.trim() || null,
          price: price ? parseFloat(price) : null,
          imageUrl: imageUrl.trim() || null,
          inStock,
          categoryId,
        }),
      }
    )

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Błąd serwera')
      setLoading(false)
      return
    }

    router.push('/admin/produkty')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Czy na pewno chcesz usunąć "${name}"? Tej operacji nie można cofnąć.`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/produkty/${defaultValues!.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/produkty')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Błąd usuwania')
      setLoading(false)
    }
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500'
  const lbl = 'block text-sm font-medium text-gray-700 mb-1'
  const req = <span className="text-red-500">*</span>

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={lbl}>Nazwa {req}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inp}
            placeholder="np. Lampa LED Whelen L10"
          />
        </div>
        <div>
          <label className={lbl}>Slug {req}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugLocked(true) }}
              required
              className={inp}
              placeholder="lampa-led-whelen-l10"
            />
            {slugLocked && (
              <button
                type="button"
                onClick={() => { setSlugLocked(false); setSlug(toSlug(name)) }}
                title="Resetuj do auto-generowanego"
                className="border border-gray-300 rounded-lg px-2 text-xs text-gray-500 hover:bg-gray-50 whitespace-nowrap"
              >
                ↺ Auto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={lbl}>SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className={inp}
            placeholder="np. WHL-L10-BL"
          />
        </div>
        <div>
          <label className={lbl}>Marka</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className={inp}
            placeholder="np. Whelen"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={lbl}>Kategoria {req}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={inp}
          >
            <option value="">Wybierz kategorię</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Cena brutto (PLN) {req}</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className={inp}
            placeholder="499.00"
          />
        </div>
      </div>

      <div>
        <label className={lbl}>Opis {req}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className={inp}
          placeholder="Szczegółowy opis produktu..."
        />
      </div>

      <div>
        <label className={lbl}>URL zdjęcia</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={inp}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
        />
        <label htmlFor="inStock" className="text-sm text-gray-700">
          Dostępny (w magazynie)
        </label>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Zapisz produkt'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/produkty')}
            disabled={loading}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            Anuluj
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="border border-red-200 text-red-600 hover:bg-red-50 text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
          >
            Usuń produkt
          </button>
        )}
      </div>
    </form>
  )
}
