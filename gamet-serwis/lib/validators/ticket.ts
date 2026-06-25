import { z } from 'zod'
import { LAMP_TYPES, OTHER_LAMP_MODEL } from '@/lib/lamp-types'

export const ticketNumberSchema = z
  .string()
  .regex(/^SRW\/\d{5}\/\d{4}$/, 'Numer musi być w formacie SRW/NNNNN/RRRR (np. SRW/00116/2026)')

export const lampSelectionSchema = z
  .object({
    lampModel: z.string().min(1, 'Wybierz model lampy'),
    lampGroupCode: z.string().nullish(),
  })
  .refine(
    (data) =>
      data.lampModel === OTHER_LAMP_MODEL ||
      LAMP_TYPES.some(
        (t) => t.name === data.lampModel && t.groupCode === data.lampGroupCode
      ),
    { message: 'Nieprawidłowy model lampy', path: ['lampModel'] }
  )
