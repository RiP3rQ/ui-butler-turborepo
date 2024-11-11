import { z } from "zod";

export const createWorkflowSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(3).max(1000).optional(),
});

export type CreateWorkflowSchemaType = z.infer<typeof createWorkflowSchema>;

export const duplicateWorkflowSchema = createWorkflowSchema.extend({
  workflowId: z.string(),
});

export type DuplicateWorkflowSchemaType = z.infer<
  typeof duplicateWorkflowSchema
>;
