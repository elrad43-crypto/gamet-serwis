'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Czy na pewno chcesz usunąć "${name}"?`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/produkty/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Błąd usuwania produktu')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline text-xs font-medium disabled:opacity-40"
    >
      {loading ? '...' : 'Usuń'}
    </button>
  )
}
