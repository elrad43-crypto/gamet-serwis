// Rozwija zapis z kartki miesięcznej na listę pełnych numerów seryjnych.
// Wspiera: pojedynczy numer ("2600213"), zakres ("2600206-208" lub z myślnikiem "–"),
// oraz listę po przecinku, gdzie krótsze liczby dopełniają sufiks poprzedniego
// pełnego numeru (np. "2600204,205" => ["2600204", "2600205"]).

export class SerialRangeError extends Error {}

function resolveAbsolute(token: string, base: string): string {
  if (!/^\d+$/.test(token)) {
    throw new SerialRangeError(`Nieprawidłowy numer seryjny: "${token}"`)
  }
  if (base && token.length < base.length) {
    return base.slice(0, base.length - token.length) + token
  }
  return token
}

export function expandSerialNumbers(raw: string): string[] {
  const normalized = raw.replace(/[–—]/g, '-').trim()
  if (!normalized) {
    throw new SerialRangeError('Podaj co najmniej jeden numer seryjny')
  }

  const segments = normalized
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const result: string[] = []
  let base = ''

  for (const segment of segments) {
    if (segment.includes('-')) {
      const parts = segment.split('-').map((s) => s.trim())
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new SerialRangeError(`Nieprawidłowy zakres: "${segment}"`)
      }
      const start = resolveAbsolute(parts[0], base)
      base = start
      const end = resolveAbsolute(parts[1], base)

      const startNum = BigInt(start)
      const endNum = BigInt(end)
      if (endNum < startNum) {
        throw new SerialRangeError(`Zakres "${segment}": koniec jest mniejszy niż początek`)
      }
      if (endNum - startNum > BigInt(500)) {
        throw new SerialRangeError(`Zakres "${segment}" jest podejrzanie duży (ponad 500 sztuk)`)
      }

      for (let n = startNum; n <= endNum; n++) {
        result.push(n.toString().padStart(start.length, '0'))
      }
      base = end
    } else {
      const value = resolveAbsolute(segment, base)
      result.push(value)
      base = value
    }
  }

  const unique = new Set(result)
  if (unique.size !== result.length) {
    throw new SerialRangeError('Zakres zawiera powtórzone numery seryjne')
  }

  return result
}
