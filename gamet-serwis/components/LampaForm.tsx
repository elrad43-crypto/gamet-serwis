'use client'

import { useState } from 'react'
import { lampaFormSchema } from '@/lib/validators/lampa'

const COLOR_LABELS: Record<string, string> = {
  A: 'Żółta',
  R: 'Czerwona',
  B: 'Niebieska',
}

const VOLTAGE_OPTIONS = ['12V', '24V', '12/24V'] as const

export interface WariantOption {
  code: string
  color: string
  opis: string
}

interface FormData {
  wariantCode: string
  voltage: string
  lengthMm: string
  orderRef: string
  customerName: string
  serialNumbers: string
  productionDate: string
  notes: string
}

const EMPTY_FORM: FormData = {
  wariantCode: '',
  voltage: '',
  lengthMm: '',
  orderRef: '',
  customerName: '',
  serialNumbers: '',
  productionDate: '',
  notes: '',
}

interface LampaFormProps {
  warianty: WariantOption[]
  klienci: string[]
}

export default function LampaForm({ warianty, klienci }: LampaFormProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)

  const wariantyByColor = (['A', 'R', 'B'] as const).map((color) => ({
    color,
    label: COLOR_LABELS[color],
    options: warianty.filter((w) => w.color === color),
  }))

  function validate(): boolean {
    const result = lampaFormSchema.safeParse(form)
    if (result.success) {
      setErrors({})
      return true
    }
    const newErrors: Partial<FormData> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormData | undefined
      if (field && !newErrors[field]) newErrors[field] = issue.message
    }
    setErrors(newErrors)
    return false
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSuccess(null)
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/lampy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Wystąpił błąd. Spróbuj ponownie.')
        return
      }
      setSuccess(data.serialNumbers)
      setForm(EMPTY_FORM)
    } catch {
      setSubmitError('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
          Zapisano {success.length} {success.length === 1 ? 'lampę' : 'lampy'}: {success.join(', ')}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wariant ORION <span className="text-red-500">*</span>
          </label>
          <select
            name="wariantCode"
            value={form.wariantCode}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.wariantCode ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">Wybierz wariant...</option>
            {wariantyByColor.map(({ color, label, options }) => (
              <optgroup key={color} label={label}>
                {options.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} — {w.opis}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.wariantCode && <p className="text-red-500 text-xs mt-1">{errors.wariantCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zasilanie <span className="text-red-500">*</span>
          </label>
          <select
            name="voltage"
            value={form.voltage}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.voltage ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">Wybierz...</option>
            {VOLTAGE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          {errors.voltage && <p className="text-red-500 text-xs mt-1">{errors.voltage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Długość [mm]</label>
          <input
            type="number"
            name="lengthMm"
            value={form.lengthMm}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nr zamówienia</label>
          <input
            type="text"
            name="orderRef"
            value={form.orderRef}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="336"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Klient <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            list="klienci-list"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerName ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="AXELL"
          />
          <datalist id="klienci-list">
            {klienci.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer(y) seryjny(e) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="serialNumbers"
            value={form.serialNumbers}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.serialNumbers ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="2600213  albo  2600206-208  albo  2600204,205"
          />
          <p className="text-gray-400 text-xs mt-1">
            Pojedynczy numer, zakres (2600206-208 = 3 sztuki) lub lista po przecinku (2600204,205).
          </p>
          {errors.serialNumbers && <p className="text-red-500 text-xs mt-1">{errors.serialNumbers}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data produkcji</label>
          <input
            type="date"
            name="productionDate"
            value={form.productionDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Uwagi</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Opcjonalnie"
          />
        </div>
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
        {loading ? 'Zapisywanie...' : 'Zapisz lampę(y)'}
      </button>
    </form>
  )
}
