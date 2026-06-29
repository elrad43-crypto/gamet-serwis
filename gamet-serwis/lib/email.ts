import { Resend } from 'resend'
import { getLampCategory } from '@/lib/lamp-types'
import { generateMonthlyReportPdf } from '@/lib/pdf-report'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL || 'serwis@gamet.pl'

// Sandbox Resend: onboarding@resend.dev może wysyłać tylko na adres właściciela konta
const SERVICE_NOTIFICATION_EMAIL = 'elrad43@gmail.com'

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nowe',
  IN_PROGRESS: 'W realizacji',
  WAITING_FOR_PARTS: 'Oczekiwanie na części',
  COMPLETED: 'Zakończone',
  CLOSED: 'Zamknięte',
}

const SEP_DOUBLE = '═══════════════════════════════════════'
const SEP_SINGLE = '───────────────────────────────────────'
const INTRO =
  'dziękujemy, że zwrócili się Państwo do PW GAMET.\n' +
  'Każde zgłoszenie traktujemy poważnie i z należytą\n' +
  'starannością — Państwa sprawa została przyjęta\n' +
  'i już się nią zajmujemy.'

function buildRow(label: string, value: string, labelWidth: number): string {
  const prefix = `${label}:`.padEnd(labelWidth)
  const maxValueWidth = 75 - labelWidth
  if (value.length <= maxValueWidth) return `${prefix}${value}`
  const indent = ' '.repeat(labelWidth)
  const words = value.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (!current) {
      current = word
    } else if (current.length + 1 + word.length <= maxValueWidth) {
      current += ` ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return `${prefix}${lines.join('\n' + indent)}`
}

export async function sendTicketConfirmation(params: {
  to: string
  clientName: string
  ticketNumber?: string | null
  lampModel: string
  lampGroupCode?: string | null
  description: string
}) {
  const lampCategory = getLampCategory(params.lampGroupCode)
  const rows: [string, string][] = [
    ...(params.ticketNumber ? [['Numer SRW', params.ticketNumber] as [string, string]] : []),
    ['Model lampy', `${params.lampModel}${lampCategory ? ` (${lampCategory})` : ''}`],
    ['Opis usterki', params.description],
    ['Status', 'Nowe'],
  ]
  const labelWidth = Math.max(...rows.map(([l]) => l.length + 1)) + 1
  const text = [
    'POTWIERDZENIE ZGŁOSZENIA SERWISOWEGO',
    SEP_DOUBLE,
    '',
    'Dzień dobry,',
    '',
    INTRO,
    '',
    'Szczegóły zgłoszenia:',
    SEP_SINGLE,
    ...rows.map(([label, value]) => buildRow(label, value, labelWidth)),
    SEP_SINGLE,
    '',
    'Nasz serwis skontaktuje się z Państwem w najbliższym czasie.',
    '',
    'Z poważaniem,',
    'Zespół Serwisu PW GAMET',
  ].join('\n')

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.ticketNumber
      ? `Potwierdzenie zgłoszenia serwisowego #${params.ticketNumber} – Gamet`
      : `Potwierdzenie zgłoszenia serwisowego – Gamet`,
    text,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}

export async function sendInternalTicketNotification(params: {
  ticketNumber?: string | null
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  companyName?: string | null
  shippingStreet?: string | null
  shippingPostalCode?: string | null
  shippingCity?: string | null
  lampModel: string
  lampGroupCode?: string | null
  serialNumber?: string | null
  description: string
}) {
  const lampCategory = getLampCategory(params.lampGroupCode)
  const shippingAddress = [
    params.shippingStreet,
    [params.shippingPostalCode, params.shippingCity].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')

  const rows: [string, string][] = [
    ...(params.ticketNumber ? [['Numer SRW', params.ticketNumber] as [string, string]] : []),
    ['Klient', `${params.clientName}${params.companyName ? ` (${params.companyName})` : ''}`],
    ['Kontakt', `${params.clientEmail}${params.clientPhone ? `, ${params.clientPhone}` : ''}`],
    ...(shippingAddress ? ([['Adres wysyłki', shippingAddress]] as [string, string][]) : []),
    ['Model lampy', `${params.lampModel}${lampCategory ? ` (${lampCategory})` : ''}`],
    ...(params.serialNumber ? ([['Nr seryjny', params.serialNumber]] as [string, string][]) : []),
    ['Opis usterki', params.description],
  ]
  const labelWidth = Math.max(...rows.map(([l]) => l.length + 1)) + 1
  const text = [
    'NOWE ZGŁOSZENIE SERWISOWE',
    SEP_DOUBLE,
    '',
    'Dzień dobry,',
    '',
    INTRO,
    '',
    'Szczegóły zgłoszenia:',
    SEP_SINGLE,
    ...rows.map(([label, value]) => buildRow(label, value, labelWidth)),
    SEP_SINGLE,
    '',
    'Z poważaniem,',
    'Zespół Serwisu PW GAMET',
  ].join('\n')

  const { error } = await resend.emails.send({
    from: FROM,
    to: SERVICE_NOTIFICATION_EMAIL,
    subject: params.ticketNumber
      ? `Nowe zgłoszenie serwisowe #${params.ticketNumber}`
      : `Nowe zgłoszenie serwisowe`,
    text,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}

const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
]

export type TicketForReport = {
  number: string | null
  clientName: string
  companyName?: string | null
  clientEmail: string
  clientPhone?: string | null
  lampModel: string
  lampGroupCode?: string | null
  serialNumber?: string | null
  status: string
  createdAt: Date
  description: string
}

export async function sendMonthlyReport(params: {
  month: number
  year: number
  tickets: TicketForReport[]
}) {
  const { month, year, tickets } = params
  const monthName = MONTHS_PL[month - 1]
  const monthLabel = `${monthName.toUpperCase()} ${year}`

  const firstDay = `01.${String(month).padStart(2, '0')}.${year}`
  const lastDayDate = new Date(year, month, 0)
  const lastDay = `${String(lastDayDate.getDate()).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`

  const counts: Record<string, number> = {}
  for (const t of tickets) counts[t.status] = (counts[t.status] ?? 0) + 1

  const summaryRows: [string, string][] = [
    ['Nowe', String(counts['NEW'] ?? 0)],
    ['W realizacji', String(counts['IN_PROGRESS'] ?? 0)],
    ['Oczekiwanie na części', String(counts['WAITING_FOR_PARTS'] ?? 0)],
    ['Zakończone', String(counts['COMPLETED'] ?? 0)],
    ['Zamknięte', String(counts['CLOSED'] ?? 0)],
  ]
  const summaryLabelWidth = Math.max(...summaryRows.map(([l]) => l.length + 1)) + 1

  // Grupuj po nazwie produktu, pokaż tylko produkt i ilość
  const productCounts = new Map<string, number>()
  for (const t of tickets) {
    const cat = getLampCategory(t.lampGroupCode)
    const product = `${t.lampModel}${cat ? ` (${cat})` : ''}`
    productCounts.set(product, (productCounts.get(product) ?? 0) + 1)
  }
  const productLines = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([product, count]) => `${product.padEnd(38)}${String(count).padStart(3)} szt.`)

  const pdf = await generateMonthlyReportPdf({ month, year, tickets })

  const text = [
    `RAPORT MIESIĘCZNY SERWISU — ${monthLabel}`,
    SEP_DOUBLE,
    '',
    buildRow('Okres', `${firstDay} – ${lastDay}`, 11),
    buildRow('Zgłoszeń', String(tickets.length), 11),
    '',
    'PODSUMOWANIE PO STATUSACH',
    SEP_SINGLE,
    ...summaryRows.map(([l, v]) => buildRow(l, v, summaryLabelWidth)),
    SEP_SINGLE,
    '',
    ...(tickets.length > 0
      ? [
          'PRODUKTY',
          SEP_SINGLE,
          ...productLines,
          SEP_SINGLE,
          '',
          'W załączniku raport w formacie PDF.',
        ]
      : ['Brak zgłoszeń w tym miesiącu.']),
    '',
    'Z poważaniem,',
    'Zespół Serwisu PW GAMET',
  ].join('\n')

  const { error } = await resend.emails.send({
    from: FROM,
    to: SERVICE_NOTIFICATION_EMAIL,
    subject: `Raport miesięczny serwisu — ${monthName} ${year}`,
    text,
    attachments: [
      {
        filename: `raport-serwis-${year}-${String(month).padStart(2, '0')}.pdf`,
        content: pdf,
      },
    ],
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}

export async function sendShipmentNotification(params: {
  to: string
  clientName: string
  shipmentNumber: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: 'Serwis zakończony – zgłoszenie zostało nadane',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Serwis zakończony – przesyłka nadana</h2>
        <p>Dzień dobry ${params.clientName},</p>
        <p>z przyjemnością informujemy, że serwis Państwa urządzenia został zakończony.
        Naprawiony sprzęt został właśnie nadany przesyłką kurierską na wskazany adres.</p>
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
          <strong>Numer przesyłki: ${params.shipmentNumber}</strong>
        </div>
        <p>Status przesyłki mogą Państwo śledzić na stronie przewoźnika.</p>
        <p>Dziękujemy za zaufanie i skorzystanie z naszego serwisu.
        W razie pytań pozostajemy do Państwa dyspozycji.</p>
        <p style="margin-top: 30px;">
          Z poważaniem,<br>
          <strong>Zespół serwisu</strong><br>
          Przedsiębiorstwo Wytwórcze GAMET<br>
          tel. +48 24 365 26 00<br>
          info@pwgamet.com.pl
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          Gamet – Producent Lamp Ostrzegawczych<br>
          Ten email został wygenerowany automatycznie.
        </p>
      </div>
    `,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}

export async function sendStatusUpdate(params: {
  to: string
  clientName: string
  ticketNumber: string | null
  newStatus: string
  note?: string
}) {
  const statusLabel = STATUS_LABELS[params.newStatus] || params.newStatus
  const ticketRef = params.ticketNumber ? `#${params.ticketNumber}` : 'Twojego zgłoszenia'

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Aktualizacja ${ticketRef} – ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Aktualizacja zgłoszenia serwisowego</h2>
        <p>Dzień dobry ${params.clientName},</p>
        <p>Status ${ticketRef === 'Twojego zgłoszenia' ? ticketRef : `zgłoszenia serwisowego <strong>${ticketRef}</strong>`} został zaktualizowany:</p>
        <div style="background: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <strong>Nowy status: ${statusLabel}</strong>
        </div>
        ${params.note ? `<p><strong>Wiadomość od serwisu:</strong> ${params.note}</p>` : ''}
        <p>W razie pytań prosimy o kontakt.</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          Gamet &#x2013; Producent Lamp Ostrzegawczych<br>
          Ten email został wygenerowany automatycznie.
        </p>
      </div>
    `,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}
