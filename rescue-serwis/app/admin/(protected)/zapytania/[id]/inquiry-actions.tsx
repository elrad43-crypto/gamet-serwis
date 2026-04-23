'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: 'NEW', label: 'Nowe' },
  { value: 'IN_PROGRESS', label: 'W trakcie' },
  { value: 'ANSWERED', label: 'Odpowiedziane' },
  { value: 'CLOSED', label: 'Zamknięte' },
]

export function InquiryActions({
  inquiryId,
  currentStatus,
  currentNotes,
}: {
  inquiryId: string
  currentStatus: string
  currentNotes: string | null
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSuccess(false)
    const res = await fetch(`/api/admin/zapytania/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    })
    if (res.ok) {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } else {
      alert('Błąd zapisu')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Aktualizacja zapytania</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notatka wewnętrzna
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          placeholder="Notatka widoczna tylko dla adminów..."
        />
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
          Zapytanie zaktualizowane.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
      </button>
    </div>
  )
}
