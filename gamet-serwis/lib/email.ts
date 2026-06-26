import { Resend } from 'resend'
import { getLampCategory } from '@/lib/lamp-types'

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
  ticketNumber: string
  lampModel: string
  lampGroupCode?: string | null
  description: string
}) {
  const lampCategory = getLampCategory(params.lampGroupCode)
  const rows: [string, string][] = [
    ['Numer SRW', params.ticketNumber],
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
    subject: `Potwierdzenie zgłoszenia serwisowego #${params.ticketNumber} – Gamet`,
    text,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}

export async function sendInternalTicketNotification(params: {
  ticketNumber: string
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
    ['Numer SRW', params.ticketNumber],
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
    subject: `Nowe zgłoszenie serwisowe #${params.ticketNumber}`,
    text,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}

export async function sendStatusUpdate(params: {
  to: string
  clientName: string
  ticketNumber: string
  newStatus: string
  note?: string
}) {
  const statusLabel = STATUS_LABELS[params.newStatus] || params.newStatus

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Aktualizacja zgłoszenia #${params.ticketNumber} – ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Aktualizacja zgłoszenia serwisowego</h2>
        <p>Dzień dobry ${params.clientName},</p>
        <p>Status Twojego zgłoszenia serwisowego <strong>#${params.ticketNumber}</strong> został zaktualizowany:</p>
        <div style="background: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <strong>Nowy status: ${statusLabel}</strong>
        </div>
        ${params.note ? `<p><strong>Wiadomość od serwisu:</strong> ${params.note}</p>` : ''}
        <p>W razie pytań prosimy o kontakt.</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          Gamet – Producent Lamp Ostrzegawczych<br>
          Ten email został wygenerowany automatycznie.
        </p>
      </div>
    `,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}
