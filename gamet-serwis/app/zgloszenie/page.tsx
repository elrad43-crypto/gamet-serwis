'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  companyName: string
  lampModel: string
  serialNumber: string
  purchaseDate: string
  description: string
}

const LAMP_MODELS = [
  'GL-100 LED',
  'GL-200 LED',
  'GL-300 Stroboskop',
  'GL-400 Xenon',
  'GL-500 Magnetyczna',
  'GL-600 Solarna',
  'Inny model',
]

export default function ZgloszenieForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [form, setForm] = useState<FormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    lampModel: '',
    serialNumber: '',
    purchaseDate: '',
    description: '',
  })

  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    if (!form.clientName.trim()) newErrors.clientName = 'Imi� i nazwisko jest wymagane'
    if (!form.clientEmail.trim()) newErrors.clientEmail = 'Email jest wymagany'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail))
      newErrors.clientEmail = 'Nieprawid�owy adres email'
    if (!form.lampModel) newErrors.lampModel = 'Wybierz model lampy'
    if (!form.description.trim()) newErrors.description = 'Opis usterki jest wymagany'
    else if (form.description.trim().length < 10)
      newErrors.description = 'Opis musi mie� co najmniej 10 znak�w'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('B��d serwera')

      const data = await res.json()
      router.push(`/zgloszenie/potwierdzenie?nr=${data.ticket.number}`)
    } catch {
      setErrors({ description: 'Wyst�pi� b��d. Spr�buj ponownie.' })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            � Powr�t do strony g��wnej
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Zg�oszenie serwisowe
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Wype�nij formularz, a skontaktujemy si� z Tob� w ci�gu 24 godzin.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Dane kontaktowe */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dane kontaktowe
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imi� i nazwisko <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientName ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Jan Kowalski"
                />
                {errors.clientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={form.clientEmail}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientEmail ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="jan@firma.pl"
                />
                {errors.clientEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={form.clientPhone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+48 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nazwa firmy (opcjonalnie)"
                />
              </div>
            </div>

            {/* Dane urz�dzenia */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dane urz�dzenia
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model lampy <span className="text-red-500">*</span>
                </label>
                <select
                  name="lampModel"
                  value={form.lampModel}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    errors.lampModel ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Wybierz model...</option>
                  {LAMP_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.lampModel && (
                  <p className="text-red-500 text-xs mt-1">{errors.lampModel}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numer seryjny
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={form.serialNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. SN-2023-00123"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data zakupu
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={form.purchaseDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Opis usterki */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Opis usterki
            </h2>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis problemu <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Opisz szczeg�owo usterk�: co si� dzieje, kiedy problem si� pojawi�, w jakich okoliczno�ciach..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Wysy�anie...' : 'Wy�lij zg�oszenie'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
