'use client'
import { useState } from 'react'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  productCount: number
}

export function KategorieClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDesc, setEditDesc] = useState('')

  async function refresh() {
    const res = await fetch('/api/admin/kategorie')
    const data = await res.json()
    setCategories(
      data.categories.map((c: Category & { _count: { products: number } }) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        productCount: c._count.products,
      }))
    )
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/kategorie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, slug: newSlug, description: newDesc }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Błąd dodawania'); setLoading(false); return }
    await refresh()
    setNewName(''); setNewSlug(''); setNewDesc('')
    setShowAdd(false)
    setLoading(false)
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditDesc(cat.description ?? '')
    setError('')
  }

  async function handleEdit(id: string) {
    setError('')
    setLoading(true)
    const res = await fetch(`/api/admin/kategorie/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, slug: editSlug, description: editDesc }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Błąd edycji'); setLoading(false); return }
    await refresh()
    setEditingId(null)
    setLoading(false)
  }

  async function handleDelete(id: string, name: string, productCount: number) {
    if (productCount > 0) {
      alert(`Nie można usunąć "${name}" — kategoria zawiera ${productCount} produkt${productCount === 1 ? '' : productCount < 5 ? 'y' : 'ów'}.`)
      return
    }
    if (!confirm(`Czy na pewno chcesz usunąć kategorię "${name}"?`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/kategorie/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Błąd usuwania'); setLoading(false); return }
    await refresh()
    setLoading(false)
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500'
  const inpSm = 'border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Kategorie
          <span className="ml-2 text-sm font-normal text-gray-500">({categories.length})</span>
        </h1>
        <button
          onClick={() => { setShowAdd(!showAdd); setError('') }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Dodaj kategorię
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Nowa kategoria</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setNewSlug(toSlug(e.target.value)) }}
                  required
                  className={inp}
                  placeholder="np. Akcesoria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  required
                  className={inp}
                  placeholder="akcesoria"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className={inp}
                placeholder="Krótki opis kategorii"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Zapisywanie...' : 'Dodaj kategorię'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nazwa</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Produktów</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) =>
              editingId === cat.id ? (
                <tr key={cat.id} className="bg-blue-50">
                  <td colSpan={4} className="px-4 py-4">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inpSm} placeholder="Nazwa" />
                      <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className={inpSm} placeholder="Slug" />
                    </div>
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className={`${inpSm} mb-3`}
                      placeholder="Opis (opcjonalnie)"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cat.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {loading ? '...' : 'Zapisz'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Anuluj
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{cat.name}</div>
                    {cat.description && <div className="text-xs text-gray-400 mt-0.5">{cat.description}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name, cat.productCount)}
                        disabled={loading || cat.productCount > 0}
                        title={cat.productCount > 0 ? 'Usuń najpierw produkty z tej kategorii' : ''}
                        className={`text-xs font-medium transition-colors ${
                          cat.productCount > 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:underline'
                        }`}
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
