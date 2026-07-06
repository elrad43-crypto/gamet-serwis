'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OTHER_LAMP_MODEL } from '@/lib/lamp-types'
import { ticketNumberSchema } from '@/lib/validators/ticket'
import LampModelPicker, { type LampSelection } from '@/components/LampModelPicker'

interface FormData {
  number: string
  clientName: string
  clientEmail: string
  clientPhone: string
  companyName: string
  shippingStreet: string
  shippingPostalCode: string
  shippingCity: string
  lampModel: string
  lampGroupCode: string
  otherModelText: string
  serialNumber: string
  purchaseDate: string
  description: string
}

interface ClientSuggestion {
  companyName: string | null
  clientName: string
  clientEmail: string
  clientPhone: string | null
}

export default function NoweZgloszenieForm({
  companyNames,
  clientSuggestions,
}: {
  companyNames: string[]
  clientSuggestions: ClientSuggestion[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [form, setForm] = useState<FormData>({
    number: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    shippingStreet: '',
    shippingPostalCode: '',
    shippingCity: '',
    lampModel: '',
    lampGroupCode: '',
    otherModelText: '',
    serialNumber: '',
    purchaseDate: '',
    description: '',
  })

  const matchingClients = useMemo(() => {
    const name = form.clientName.trim().toLowerCase()
    const company = form.companyName.trim().toLowerCase()
    const email = form.clientEmail.trim().toLowerCase()
    const phone = form.clientPhone.trim().toLowerCase()
    if (!name && !company && !email && !phone) return []
    return clientSuggestions.filter((c) => {
      if (name && !c.clientName.toLowerCase().includes(name)) return false
      if (company && !c.companyName?.toLowerCase().includes(company)) return false
      if (email && !c.clientEmail.toLowerCase().includes(email)) return false
      if (phone && !c.clientPhone?.toLowerCase().includes(phone)) return false
      return true
    })
  }, [form.clientName, form.companyName, form.clientEmail, form.clientPhone, clientSuggestions])

  useEffect(() => {
    const name = form.clientName.trim().toLowerCase()
    if (name) {
      const nameMatches = clientSuggestions.filter(
        (c) => c.clientName.trim().toLowerCase() === name
      )
      if (nameMatches.length === 1) {
        const match = nameMatches[0]
        setForm((prev) => ({
          ...prev,
          companyName: prev.companyName || match.companyName || prev.companyName,
          clientEmail: prev.clientEmail || match.clientEmail,
          clientPhone: prev.clientPhone || match.clientPhone || prev.clientPhone,
        }))
        setErrors((prev) => ({
          ...prev,
          companyName: undefined,
          clientEmail: undefined,
          clientPhone: undefined,
        }))
        return
      }
    }

    const company = form.companyName.trim().toLowerCase()
    if (company) {
      const companyMatches = clientSuggestions.filter(
        (c) => c.companyName?.trim().toLowerCase() === company
      )
      if (companyMatches.length > 0) {
        const first = companyMatches[0]
        const allSameEmail =
          first.clientEmail.trim() !== '' &&
          companyMatches.every((c) => c.clientEmail.trim() === first.clientEmail.trim())
        const allSamePhone =
          (first.clientPhone ?? '').trim() !== '' &&
          companyMatches.every(
            (c) => (c.clientPhone ?? '').trim() === (first.clientPhone ?? '').trim()
          )

        if (allSameEmail || allSamePhone) {
          setForm((prev) => ({
            ...prev,
            clientEmail: prev.clientEmail || (allSameEmail ? first.clientEmail : prev.clientEmail),
            clientPhone:
              prev.clientPhone || (allSamePhone ? first.clientPhone ?? prev.clientPhone : prev.clientPhone),
          }))
          setErrors((prev) => ({ ...prev, clientEmail: undefined, clientPhone: undefined }))
        }
      }
    }
  }, [form.clientName, form.companyName, clientSuggestions])

  const clientNameOptions = useMemo(
    () => Array.from(new Set(matchingClients.map((c) => c.clientName).filter(Boolean))),
    [matchingClients]
  )
  const clientEmailOptions = useMemo(
    () => Array.from(new Set(matchingClients.map((c) => c.clientEmail).filter(Boolean))),
    [matchingClients]
  )
  const clientPhoneOptions = useMemo(
    () => Array.from(new Set(matchingClients.map((c) => c.clientPhone).filter(Boolean) as string[])),
    [matchingClients]
  )

  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    const numberCheck = ticketNumberSchema.safeParse(form.number.trim())
    if (!numberCheck.success)
      newErrors.number = numberCheck.error.issues[0]?.message ?? 'Nieprawidłowy numer SRW'
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
    setSubmitError(null)
    if (!validate()) return

    setLoading(true)
    try {
      const description =
        form.lampModel === OTHER_LAMP_MODEL && form.otherModelText.trim()
          ? `Model: ${form.otherModelText.trim()}\n\n${form.description}`
          : form.description

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: form.number.trim(),
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone,
          companyName: form.companyName,
          shippingStreet: form.shippingStreet,
          shippingPostalCode: form.shippingPostalCode,
          shippingCity: form.shippingCity,
          lampModel: form.lampModel,
          lampGroupCode: form.lampGroupCode,
          serialNumber: form.serialNumber,
          purchaseDate: form.purchaseDate,
          description,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Wystąpił błąd. Spróbuj ponownie.')
        return
      }

      router.push(`/admin/zgloszenia/${data.ticket.id}`)
    } catch {
      setSubmitError('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function handleLampChange(next: LampSelection) {
    setForm((prev) => ({ ...prev, ...next }))
    if (errors.lampModel) {
      setErrors((prev) => ({ ...prev, lampModel: undefined }))
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/zgloszenia" className="text-blue-600 hover:underline text-sm">
          ← Powrót do listy
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Nowe zgłoszenie</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Numer SRW skopiowany z webGamet, dane klienta i urządzenia.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Numer zgłoszenia */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numer SRW <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="number"
              value={form.number}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.number ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="SRW/00116/2026"
            />
            {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
          </div>

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
                list="client-names"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clientName ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Jan Kowalski"
              />
              <datalist id="client-names">
                {clientNameOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
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
                list="client-emails"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clientEmail ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="jan@firma.pl"
              />
              <datalist id="client-emails">
                {clientEmailOptions.map((email) => (
                  <option key={email} value={email} />
                ))}
              </datalist>
              {errors.clientEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                name="clientPhone"
                value={form.clientPhone}
                onChange={handleChange}
                list="client-phones"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+48 123 456 789"
              />
              <datalist id="client-phones">
                {clientPhoneOptions.map((phone) => (
                  <option key={phone} value={phone} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                list="company-names"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nazwa firmy (opcjonalnie)"
              />
              <datalist id="company-names">
                {companyNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Adres wysyłki */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Adres wysyłki
          </h2>

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
            <LampModelPicker
              value={{
                lampModel: form.lampModel,
                lampGroupCode: form.lampGroupCode,
                serialNumber: form.serialNumber,
                otherModelText: form.otherModelText,
              }}
              onChange={handleLampChange}
              error={errors.lampModel}
            />

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data zakupu</label>
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

          <div className="mb-6">
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
              placeholder="Opisz szczegółowo usterkę..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Zapisywanie...' : 'Zapisz zgłoszenie'}
          </button>
        </form>
      </div>
    </div>
  )
}
