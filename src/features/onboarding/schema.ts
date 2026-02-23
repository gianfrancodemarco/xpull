import { z } from "zod";

export const repoSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  language: z.string().nullable(),
  stars: z.number().int().min(0),
  isPrivate: z.boolean(),
  updatedAt: z.string().datetime(),
});

export const reposResponseSchema = z.array(repoSchema);

export type RepoItem = z.infer<typeof repoSchema>;
