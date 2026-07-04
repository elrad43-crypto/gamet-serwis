import { z } from 'zod'

export const lampaFormSchema = z.object({
  wariantCode: z.string().min(1, 'Wybierz wariant'),
  voltage: z.enum(['12V', '24V', '12/24V'], { message: 'Wybierz zasilanie' }),
  lengthMm: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), { message: 'Długość musi być liczbą całkowitą' }),
  orderRef: z.string().trim().optional(),
  customerName: z.string().trim().min(1, 'Podaj klienta'),
  serialNumbers: z.string().trim().min(1, 'Podaj numer(y) seryjny(e)'),
  productionDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export type LampaFormInput = z.infer<typeof lampaFormSchema>
