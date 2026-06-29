'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LAMP_TYPES, OTHER_LAMP_MODEL } from '@/lib/lamp-types'

const STATUSES = [
  { value: 'NEW', label: 'Nowe' },
  { value: 'IN_PROGRESS', label: 'W realizacji' },
  { value: 'WAITING_FOR_PARTS', label: 'Oczekiwanie na części' },
  { value: 'COMPLETED', label: 'Zakończone' },
  { value: 'CLOSED', label: 'Zamknięte' },
]

export default function TicketActions({
  ticketId,
  currentStatus,
  currentLampModel,
  currentLampGroupCode,
  currentShipmentNumber,
}: {
  ticketId: string
  currentStatus: string
  currentLampModel: string
  currentLampGroupCode?: string | null
  currentShipmentNumber?: string | null
}) {
  const router = useRouter()

  // --- Główna sekcja aktualizacji ---
  const [status, setStatus] = useState(currentStatus)
  const [lampGroupCode, setLampGroupCode] = useState(currentLampGroupCode ?? '')
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // --- Sekcja wysyłki kurierskiej ---
  const [shipmentNumber, setShipmentNumber] = useState(currentShipmentNumber ?? '')
  const [shipmentLoading, setShipmentLoading] = useState(false)
  const [shipmentSuccess, setShipmentSuccess] = useState(false)

  const selectedLamp = lampGroupCode
    ? LAMP_TYPES.find((t) => t.groupCode === lampGroupCode) ?? null
    : null
  const lampModel = selectedLamp ? selectedLamp.name : OTHER_LAMP_MODEL

  async function handleDelete() {
    if (!confirm('Czy na pewno chcesz usunąć to zgłoszenie? Tej operacji nie można cofnąć.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Błąd')
      router.push('/admin/zgloszenia')
      router.refresh()
    } catch {
      alert('Wystąpił błąd podczas usuwania.')
      setDeleting(false)
    }
  }

  async function handleSave() {
    setLoading(true)
    setSuccess(false)

    const lampChanged =
      lampModel !== currentLampModel || (lampGroupCode || null) !== (currentLampGroupCode ?? null)

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: note.trim() || undefined,
          isPublic,
          ...(lampChanged && { lampModel, lampGroupCode: lampGroupCode || null }),
        }),
      })

      if (!res.ok) throw new Error('Błąd')

      setNote('')
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      alert('Wystąpił błąd podczas zapisywania.')
    } finally {
      setLoading(false)
    }
  }

  async function handleShipmentSave() {
    if (!shipmentNumber.trim()) {
      alert('Wpisz numer przesyłki.')
      return
    }
    setShipmentLoading(true)
    setShipmentSuccess(false)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          shipmentNumber: shipmentNumber.trim(),
          notifyShipment: true,
        }),
      })
      if (!res.ok) throw new Error('Błąd')
      setShipmentSuccess(true)
      router.refresh()
      setTimeout(() => setShipmentSuccess(false), 4000)
    } catch {
      alert('Wystąpił błąd podczas zapisywania.')
    } finally {
      setShipmentLoading(false)
    }
  }

  return (
    <>
      {/* Karta: Aktualizacja zgłoszenia */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Aktualizacja zgłoszenia</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Produkt
          </label>
          <select
            value={lampGroupCode}
            onChange={(e) => setLampGroupCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Inny / nie wiem</option>
            {LAMP_TYPES.map((t) => (
              <option key={t.groupCode} value={t.groupCode}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zmień status
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
            placeholder="Dodaj notatkę wewnętrzną lub informację dla klienta..."
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
            Wyślij notatkę do klienta emailem
          </label>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
            Zgłoszenie zostało zaktualizowane.
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading || deleting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={handleDelete}
            disabled={loading || deleting}
            className="w-full bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-200 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {deleting ? 'Usuwanie...' : 'Usuń zgłoszenie'}
          </button>
        </div>
      </div>

      {/* Karta: Wysyłka kurierska */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Wysyłka kurierska</h2>
        <p className="text-sm text-gray-500 mb-4">
          Wpisz numer przesyłki i wyślij powiadomienie do klienta.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer przesyłki
          </label>
          <input
            type="text"
            value={shipmentNumber}
            onChange={(e) => setShipmentNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="np. 12345678901234567890"
          />
        </div>

        {shipmentSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
            Numer przesyłki zapisany. Klient otrzymał powiadomienie e-mail.
          </div>
        )}

        <button
          onClick={handleShipmentSave}
          disabled={shipmentLoading || deleting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {shipmentLoading ? 'Wysyłanie...' : 'Zapisz i powiadom klienta o wysyłce'}
        </button>
      </div>
    </>
  )
}
