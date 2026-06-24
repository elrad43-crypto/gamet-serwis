'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  companyName: string
  shippingStreet: string
  shippingPostalCode: string
  shippingCity: string
  lampModel: string
  serialNumber: string
  purchaseDate: string
  description: string
}

const LAMP_MODELS = [
  'Orion A',
  'Orion B',
  'Belka LED N DeLUX',
  'Belka mini X',
  'Lampa Marta KO',
  'Lampa SLO3LED',
  'Lampa SLO3X',
  'Makroled 2',
  'Makroled LL8',
  'Inny model',
]

// Numery seryjne Gametu: stały prefiks (kod modelu + "/"), potem rok i numer.
// Makroled 2: AX06/2600000 -> prefiks "AX06/" + 2600000 (rok 26 + numer 00000).
const SERIAL_NUMBER_PREFIXES: Record<string, string> = {
  'Makroled 2': 'AX06/',
}
const SERIAL_NUMBER_HINTS: Record<string, string> = {
  'Makroled 2': 'np. 2600000 (rok+numer)',
}
const DEFAULT_SERIAL_HINT = 'np. SN-2023-00123'

export default function ZgloszenieForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [form, setForm] = useState<FormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    shippingStreet: '',
    shippingPostalCode: '',
    shippingCity: '',
    lampModel: '',
    serialNumber: '',
    purchaseDate: '',
    description: '',
  })

  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    if (!form.clientName.trim()) newErrors.clientName = 'Imię i nazwisko jest wymagane'
    if (!form.clientEmail.trim()) newErrors.clientEmail = 'Email jest wymagany'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail))
      newErrors.clientEmail = 'Nieprawidłowy adres email'
    if (!form.lampModel) newErrors.lampModel = 'Wybierz model lampy'
    if (form.shippingPostalCode.trim() && !/^\d{2}-\d{3}$/.test(form.shippingPostalCode.trim()))
      newErrors.shippingPostalCode = 'Format kodu pocztowego: XX-XXX'
    if (!form.description.trim()) newErrors.description = 'Opis usterki jest wymagany'
    else if (form.description.trim().length < 10)
      newErrors.description = 'Opis musi mieć co najmniej 10 znaków'
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

      if (!res.ok) throw new Error('Błąd serwera')

      const data = await res.json()
      router.push(`/zgloszenie/potwierdzenie?nr=${data.ticket.number}`)
    } catch {
      setErrors({ description: 'Wystąpił błąd. Spróbuj ponownie.' })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    if (name === 'lampModel') {
      setForm((prev) => ({ ...prev, lampModel: value, serialNumber: SERIAL_NUMBER_PREFIXES[value] ?? '' }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function handleSerialSuffixChange(e: React.ChangeEvent<HTMLInputElement>) {
    const prefix = SERIAL_NUMBER_PREFIXES[form.lampModel] ?? ''
    setForm((prev) => ({ ...prev, serialNumber: prefix + e.target.value }))
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Powrót do strony głównej
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Zgłoszenie serwisowe
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 24 godzin.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Dane kontaktowe */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dane kontaktowe
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imię i nazwisko <span className="text-red-500">*</span>
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

            {/* Adres wysyłki */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Adres wysyłki
            </h2>
            <p className="text-gray-500 text-xs mb-4">
              Wypełnij, jeśli paczka ma trafić do innego odbiorcy niż dane zgłaszającego powyżej
              (np. zgłoszenie z firmy, wysyłka do klienta). Jeśli pozostawisz puste, paczka
              wróci na adres zgłaszającego.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ulica i numer</label>
                <input
                  type="text"
                  name="shippingStreet"
                  value={form.shippingStreet}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ul. Przykładowa 12/3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kod pocztowy</label>
                <input
                  type="text"
                  name="shippingPostalCode"
                  value={form.shippingPostalCode}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.shippingPostalCode ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="00-000"
                />
                {errors.shippingPostalCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.shippingPostalCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Miasto</label>
                <input
                  type="text"
                  name="shippingCity"
                  value={form.shippingCity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Warszawa"
                />
              </div>
            </div>

            {/* Dane urządzenia */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dane urządzenia
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
                {SERIAL_NUMBER_PREFIXES[form.lampModel] ? (
                  <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="flex items-center bg-gray-100 text-gray-600 text-sm px-3 font-mono">
                      {SERIAL_NUMBER_PREFIXES[form.lampModel]}
                    </span>
                    <input
                      type="text"
                      name="serialNumber"
                      value={form.serialNumber.slice(SERIAL_NUMBER_PREFIXES[form.lampModel].length)}
                      onChange={handleSerialSuffixChange}
                      className="flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none"
                      placeholder={SERIAL_NUMBER_HINTS[form.lampModel] ?? DEFAULT_SERIAL_HINT}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={SERIAL_NUMBER_HINTS[form.lampModel] ?? DEFAULT_SERIAL_HINT}
                  />
                )}
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
                placeholder="Opisz szczegółowo usterkę: co się dzieje, kiedy problem się pojawił, w jakich okolicznościach..."
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
              {loading ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
