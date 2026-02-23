import { z } from "zod";

export const createImportJobSchema = z
  .object({
    selectedRepoIds: z.array(z.string()).optional(),
  })
  .optional();

export const importJobResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  progress: z.number().int().min(0).max(100),
  totalItems: z.number().int().nullable(),
  processedItems: z.number().int(),
  errorMessage: z.string().nullable(),
  errorDetails: z
    .object({ currentRepository: z.string().optional() })
    .nullable()
    .optional(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const importJobListResponseSchema = z.array(importJobResponseSchema);

export const importStatsResponseSchema = z.object({
  totalRepositories: z.number().int().min(0),
  totalCommits: z.number().int().min(0),
  totalPullRequests: z.number().int().min(0),
  totalReviews: z.number().int().min(0),
  languages: z.array(
    z.object({
      language: z.string(),
      count: z.number().int().min(0),
    }),
  ),
  earliestEventDate: z.string().datetime().nullable(),
  latestEventDate: z.string().datetime().nullable(),
});

export type CreateImportJobInput = z.infer<typeof createImportJobSchema>;
export type ImportJobResponse = z.infer<typeof importJobResponseSchema>;
export type ImportStatsResponse = z.infer<typeof importStatsResponseSchema>;
