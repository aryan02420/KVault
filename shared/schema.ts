import { z } from "zod";

export const textSecretPayloadSchema = z.object({
  type: z.literal("text"),
  data: z.string(),
});

export type TextSecretPayloadType = z.infer<typeof textSecretPayloadSchema>;

export const createTextSecretInputSchema = z.object({
  data: z.string(),
});

export const createTextSecretOutputSchema = z.object({
  id: z.string().nullish(),
});

export type CreateTextSecretInputType = z.infer<typeof createTextSecretInputSchema>;
export type CreateTextSecretOutputType = z.infer<typeof createTextSecretOutputSchema>;

export const fetchTextSecretInputSchema = z.object({
  id: z.string(),
});

export type FetchTextSecretInputType = z.infer<typeof fetchTextSecretInputSchema>;

