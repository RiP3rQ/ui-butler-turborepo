import { z } from "zod";

export const createWorkflowSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(3).max(1000).optional(),
  definition: z.string().optional(),
});
export type CreateWorkflowSchemaType = z.infer<typeof createWorkflowSchema>;

export async function validateWorkflowInput(
  input: CreateWorkflowSchemaType,
): Promise<CreateWorkflowSchemaType> {
  return createWorkflowSchema.parseAsync(input);
}

export const duplicateWorkflowSchema = createWorkflowSchema.extend({
  workflowId: z.number(),
  name: z.string().min(1, "Name is required"),
});
export type DuplicateWorkflowSchemaType = z.infer<
  typeof duplicateWorkflowSchema
>;

export async function validateDuplicateWorkflowInput(
  input: DuplicateWorkflowSchemaType,
): Promise<DuplicateWorkflowSchemaType> {
  return duplicateWorkflowSchema.parseAsync(input);
}

export const updateWorkflowSchema = z.object({
  workflowId: z.number(),
  definition: z.string(),
});

export const publishWorkflowSchema = z.object({
  workflowId: z.number(),
  flowDefinition: z.string(),
});

export const runWorkflowSchema = z.object({
  workflowId: z.number(),
  flowDefinition: z.string().optional(),
});
