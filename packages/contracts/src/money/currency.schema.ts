import { z } from "zod";

export const CurrencyCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{3}$/));

export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
