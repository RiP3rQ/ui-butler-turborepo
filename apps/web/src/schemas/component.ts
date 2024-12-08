import { z } from "zod";

export const createComponentSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required",
    })
    .max(99, {
      message: "Title should be less than 100 characters",
    }),
  projectId: z.string().min(1, {
    message: "Project is required",
  }),
  code: z.string().min(1, {
    message: "Code is required",
  }),
});

export type CreateComponentSchemaType = z.infer<typeof createComponentSchema>;
