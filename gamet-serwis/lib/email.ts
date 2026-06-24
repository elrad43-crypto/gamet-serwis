import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL || 'serwis@gamet.pl'

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nowe',
  IN_PROGRESS: 'W realizacji',
  WAITING_FOR_PARTS: 'Oczekiwanie na cz�ci',
  COMPLETED: 'Zako�czone',
  CLOSED: 'Zamkni�te',
}

export async function sendTicketConfirmation(params: {
  to: string
  clientName: string
  ticketNumber: string
  lampModel: string
  description: string
}) {
  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Potwierdzenie zg�oszenia serwisowego #${params.ticketNumber} � Gamet`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Zg�oszenie serwisowe przyj�te</h2>
        <p>Dzie� dobry ${params.clientName},</p>
        <p>Twoje zg�oszenie serwisowe zosta�o przyj�te. Poni�ej znajdziesz podsumowanie:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Numer zg�oszenia</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>${params.ticketNumber}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Model lampy</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${params.lampModel}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Opis usterki</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${params.description}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status</td>
            <td style="padding: 10px; border: 1px solid #ddd;">Nowe</td>
          </tr>
        </table>
        <p>Nasz serwis skontaktuje si� z Tob� w najbli�szym czasie.</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          Gamet � Producent Lamp Ostrzegawczych<br>
          Ten email zosta� wygenerowany automatycznie.
        </p>
      </div>
    `,
  })
}

export async function sendStatusUpdate(params: {
  to: string
  clientName: string
  ticketNumber: string
  newStatus: string
  note?: string
}) {
  const statusLabel = STATUS_LABELS[params.newStatus] || params.newStatus

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Aktualizacja zg�oszenia #${params.ticketNumber} � ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Aktualizacja zg�oszenia serwisowego</h2>
        <p>Dzie� dobry ${params.clientName},</p>
        <p>Status Twojego zg�oszenia serwisowego <strong>#${params.ticketNumber}</strong> zosta� zaktualizowany:</p>
        <div style="background: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <strong>Nowy status: ${statusLabel}</strong>
        </div>
        ${params.note ? `<p><strong>Wiadomo�� od serwisu:</strong> ${params.note}</p>` : ''}
        <p>W razie pyta� prosimy o kontakt.</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          Gamet � Producent Lamp Ostrzegawczych<br>
          Ten email zosta� wygenerowany automatycznie.
        </p>
      </div>
    `,
  })
}
