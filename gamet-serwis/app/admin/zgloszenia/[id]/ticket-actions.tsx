'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: 'NEW', label: 'Nowe' },
  { value: 'IN_PROGRESS', label: 'W realizacji' },
  { value: 'WAITING_FOR_PARTS', label: 'Oczekiwanie na cz�ci' },
  { value: 'COMPLETED', label: 'Zako�czone' },
  { value: 'CLOSED', label: 'Zamkni�te' },
]

export default function TicketActions({
  ticketId,
  currentStatus,
}: {
  ticketId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: note.trim() || undefined, isPublic }),
      })

      if (!res.ok) throw new Error('B��d')

      setNote('')
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      alert('Wyst�pi� b��d podczas zapisywania.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Aktualizacja zg�oszenia</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zmie� status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notatka (opcjonalna)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Dodaj notatk� wewn�trzn� lub informacj� dla klienta..."
        />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          Wy�lij notatk� do klienta emailem
        </label>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
          Zg�oszenie zosta�o zaktualizowane.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
      </button>
    </div>
  )
}
