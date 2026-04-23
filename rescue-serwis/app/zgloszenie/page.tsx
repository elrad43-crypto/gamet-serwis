'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  institutionName: string
  unitName: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  equipmentType: string
  equipmentModel: string
  serialNumber: string
  equipmentYear: string
  description: string
  priority: string
}

const EQUIPMENT_TYPES = [
  { value: 'LAMP', label: 'Lampa ostrzegawcza' },
  { value: 'SPEAKER', label: 'Głośnik / nagłośnienie' },
  { value: 'GENERATOR', label: 'Generator prądu' },
  { value: 'SIREN', label: 'Syrena alarmowa' },
  { value: 'SIGNALLER', label: 'Sygnalizator świetlny' },
  { value: 'OTHER', label: 'Inne urządzenie ostrzegawcze' },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Niski – sprzęt zapasowy', color: 'text-gray-600' },
  { value: 'NORMAL', label: 'Normalny – standardowy czas naprawy', color: 'text-blue-600' },
  { value: 'HIGH', label: 'Wysoki – sprzęt potrzebny wkrótce', color: 'text-orange-600' },
  { value: 'CRITICAL', label: 'Krytyczny – sprzęt w aktywnym użyciu', color: 'text-red-600' },
]

export default function ZgloszenieForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [form, setForm] = useState<FormData>({
    institutionName: '',
    unitName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    equipmentType: '',
    equipmentModel: '',
    serialNumber: '',
    equipmentYear: '',
    description: '',
    priority: 'NORMAL',
  })

  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    if (!form.institutionName.trim()) newErrors.institutionName = 'Nazwa jednostki jest wymagana'
    if (!form.contactPerson.trim()) newErrors.contactPerson = 'Osoba kontaktowa jest wymagana'
    if (!form.contactEmail.trim()) newErrors.contactEmail = 'Email jest wymagany'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      newErrors.contactEmail = 'Nieprawidłowy adres email'
    if (!form.contactPhone.trim()) newErrors.contactPhone = 'Telefon jest wymagany'
    if (!form.equipmentType) newErrors.equipmentType = 'Wybierz typ sprzętu'
    if (!form.equipmentModel.trim()) newErrors.equipmentModel = 'Model urządzenia jest wymagany'
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
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const inputClass = (field: keyof FormData) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-red-600 hover:underline text-sm">
            ← Powrót do strony głównej
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-lg">
              🔧
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Zgłoszenie serwisowe
            </h1>
          </div>
          <p className="text-gray-500 mb-8 text-sm">
            Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 24 godzin.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Dane jednostki */}
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dane jednostki / instytucji
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nazwa jednostki <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleChange}
                  className={inputClass('institutionName')}
                  placeholder="np. OSP Kraków, PSP Warszawa, WOPR Gdańsk"
                />
                {errors.institutionName && (
                  <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jednostka / oddział
                </label>
                <input
                  type="text"
                  name="unitName"
                  value={form.unitName}
                  onChange={handleChange}
                  className={inputClass('unitName')}
                  placeholder="np. Jednostka nr 3 (opcjonalnie)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Osoba kontaktowa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  className={inputClass('contactPerson')}
                  placeholder="Imię i nazwisko"
                />
                {errors.contactPerson && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  className={inputClass('contactEmail')}
                  placeholder="kontakt@jednostka.pl"
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className={inputClass('contactPhone')}
                  placeholder="+48 123 456 789"
                />
                {errors.contactPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            {/* Dane sprzętu */}
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Dane sprzętu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ sprzętu <span className="text-red-500">*</span>
                </label>
                <select
                  name="equipmentType"
                  value={form.equipmentType}
                  onChange={handleChange}
                  className={`${inputClass('equipmentType')} bg-white`}
                >
                  <option value="">Wybierz typ...</option>
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.equipmentType && (
                  <p className="text-red-500 text-xs mt-1">{errors.equipmentType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model / nazwa urządzenia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="equipmentModel"
                  value={form.equipmentModel}
                  onChange={handleChange}
                  className={inputClass('equipmentModel')}
                  placeholder="np. FL-2000 LED, Honda EU22i"
                />
                {errors.equipmentModel && (
                  <p className="text-red-500 text-xs mt-1">{errors.equipmentModel}</p>
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
                  className={inputClass('serialNumber')}
                  placeholder="opcjonalnie"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rok produkcji / zakupu
                </label>
                <input
                  type="text"
                  name="equipmentYear"
                  value={form.equipmentYear}
                  onChange={handleChange}
                  className={inputClass('equipmentYear')}
                  placeholder="np. 2021"
                />
              </div>
            </div>

            {/* Priorytet */}
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Priorytet naprawy
            </h2>

            <div className="mb-6 space-y-2">
              {PRIORITIES.map((p) => (
                <label
                  key={p.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.priority === p.value
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={form.priority === p.value}
                    onChange={handleChange}
                    className="text-red-600"
                  />
                  <span className={`text-sm font-medium ${p.color}`}>{p.label}</span>
                </label>
              ))}
            </div>

            {/* Opis usterki */}
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
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
                className={`${inputClass('description')} resize-none`}
                placeholder="Opisz szczegółowo usterkę: co się dzieje, od kiedy, w jakich okolicznościach, czy były wcześniejsze naprawy..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Wysyłanie...' : 'Wyślij zgłoszenie serwisowe'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
