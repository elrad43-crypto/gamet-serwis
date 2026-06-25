'use client'

import { LAMP_TYPES, LAMP_CATEGORIES, OTHER_LAMP_MODEL } from '@/lib/lamp-types'

const OTHER_OPTION_VALUE = 'OTHER'
const DEFAULT_SERIAL_HINT = 'np. SN-2023-00123'
const CATALOG_SERIAL_HINT = 'np. 2600000 (rok+numer)'

export interface LampSelection {
  lampModel: string
  lampGroupCode: string
  serialNumber: string
  otherModelText: string
}

interface LampModelPickerProps {
  value: LampSelection
  onChange: (value: LampSelection) => void
  error?: string
}

export default function LampModelPicker({ value, onChange, error }: LampModelPickerProps) {
  function handleLampModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (v === OTHER_OPTION_VALUE) {
      onChange({ ...value, lampModel: OTHER_LAMP_MODEL, lampGroupCode: '', serialNumber: '' })
    } else {
      const lampType = LAMP_TYPES.find((t) => t.groupCode === v)
      onChange({
        ...value,
        lampModel: lampType?.name ?? '',
        lampGroupCode: v,
        serialNumber: v ? `${v}/` : '',
      })
    }
  }

  function handleSerialSuffixChange(e: React.ChangeEvent<HTMLInputElement>) {
    const prefix = `${value.lampGroupCode}/`
    onChange({ ...value, serialNumber: prefix + e.target.value })
  }

  function handleSerialChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, serialNumber: e.target.value })
  }

  function handleOtherModelTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, otherModelText: e.target.value })
  }

  const selectedValue = value.lampModel === OTHER_LAMP_MODEL ? OTHER_OPTION_VALUE : value.lampGroupCode

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model lampy <span className="text-red-500">*</span>
        </label>
        <select
          name="lampModel"
          value={selectedValue}
          onChange={handleLampModelChange}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          <option value="">Wybierz model...</option>
          {LAMP_CATEGORIES.map((category) => (
            <optgroup key={category} label={category}>
              {LAMP_TYPES.filter((t) => t.category === category).map((t) => (
                <option key={t.groupCode} value={t.groupCode}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={OTHER_OPTION_VALUE}>{OTHER_LAMP_MODEL}</option>
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Numer seryjny</label>
        {value.lampGroupCode ? (
          <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <span className="flex items-center bg-gray-100 text-gray-600 text-sm px-3 font-mono">
              {value.lampGroupCode}/
            </span>
            <input
              type="text"
              name="serialNumber"
              value={value.serialNumber.slice(value.lampGroupCode.length + 1)}
              onChange={handleSerialSuffixChange}
              className="flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none"
              placeholder={CATALOG_SERIAL_HINT}
            />
          </div>
        ) : (
          <input
            type="text"
            name="serialNumber"
            value={value.serialNumber}
            onChange={handleSerialChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={DEFAULT_SERIAL_HINT}
          />
        )}
      </div>

      {value.lampModel === OTHER_LAMP_MODEL && (
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa modelu (jeśli znana)
          </label>
          <input
            type="text"
            name="otherModelText"
            value={value.otherModelText}
            onChange={handleOtherModelTextChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Np. nazwa z tabliczki znamionowej"
          />
        </div>
      )}
    </>
  )
}
