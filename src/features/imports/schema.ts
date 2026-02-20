import { z } from "zod";

export const createImportJobSchema = z.object({}).optional();

export const importJobResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  progress: z.number().int().min(0).max(100),
  totalItems: z.number().int().nullable(),
  processedItems: z.number().int(),
  errorMessage: z.string().nullable(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const importJobListResponseSchema = z.array(importJobResponseSchema);

export type CreateImportJobInput = z.infer<typeof createImportJobSchema>;
export type ImportJobResponse = z.infer<typeof importJobResponseSchema>;
