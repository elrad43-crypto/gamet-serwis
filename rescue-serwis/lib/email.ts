import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL || 'serwis@rescueservice.pl'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nowe',
  DIAGNOSED: 'Zdiagnozowane',
  IN_REPAIR: 'W naprawie',
  WAITING_FOR_PARTS: 'Oczekiwanie na części',
  READY_FOR_PICKUP: 'Gotowe do odbioru',
  COMPLETED: 'Zakończone',
  CANCELLED: 'Anulowane',
}

const EQUIPMENT_LABELS: Record<string, string> = {
  LAMP: 'Lampa ostrzegawcza',
  SPEAKER: 'Głośnik/nagłośnienie',
  GENERATOR: 'Generator',
  SIREN: 'Syrena alarmowa',
  SIGNALLER: 'Sygnalizator',
  OTHER: 'Inne urządzenie',
}

export async function sendTicketConfirmation(params: {
  to: string
  contactPerson: string
  institutionName: string
  ticketNumber: string
  equipmentType: string
  equipmentModel: string
  description: string
  priority: string
}) {
  const equipmentLabel = EQUIPMENT_LABELS[params.equipmentType] || params.equipmentType

  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Potwierdzenie zgłoszenia serwisowego #${params.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Serwis Sprzętu Ratowniczego</h2>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Dzień dobry ${params.contactPerson},</p>
          <p>Zgłoszenie serwisowe dla jednostki <strong>${params.institutionName}</strong> zostało przyjęte.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #fef2f2;">
              <td style="padding: 10px; border: 1px solid #fecaca; font-weight: bold;">Numer zgłoszenia</td>
              <td style="padding: 10px; border: 1px solid #fecaca;"><strong>${params.ticketNumber}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Typ urządzenia</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${equipmentLabel}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Model</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${params.equipmentModel}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Opis usterki</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${params.description}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Status</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">Nowe</td>
            </tr>
          </table>
          <p>Nasz serwis skontaktuje się z Państwem w najbliższym czasie.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            Serwis Sprzętu Ratowniczego<br>
            Ten email został wygenerowany automatycznie.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendStatusUpdate(params: {
  to: string
  contactPerson: string
  institutionName: string
  ticketNumber: string
  newStatus: string
  note?: string
}) {
  const statusLabel = STATUS_LABELS[params.newStatus] || params.newStatus

  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Aktualizacja zgłoszenia #${params.ticketNumber} – ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Serwis Sprzętu Ratowniczego</h2>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Dzień dobry ${params.contactPerson},</p>
          <p>Status zgłoszenia serwisowego <strong>#${params.ticketNumber}</strong> dla jednostki <strong>${params.institutionName}</strong> został zaktualizowany:</p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <strong>Nowy status: ${statusLabel}</strong>
          </div>
          ${params.note ? `<p><strong>Wiadomość od serwisu:</strong> ${params.note}</p>` : ''}
          <p>W razie pytań prosimy o kontakt.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            Serwis Sprzętu Ratowniczego<br>
            Ten email został wygenerowany automatycznie.
          </p>
        </div>
      </div>
    `,
  })
}
