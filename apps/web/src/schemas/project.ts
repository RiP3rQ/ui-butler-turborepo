import { z } from "zod";

export const createNewProjectSchema = z.object({
  title: z.string().min(1).max(30),
  description: z.string().min(1).max(1000).optional(),
  color: z.string().min(7).max(7),
});
export type CreateNewProjectSchemaType = z.infer<typeof createNewProjectSchema>;

export async function validateProjectInput(
  input: CreateNewProjectSchemaType,
): Promise<CreateNewProjectSchemaType> {
  return createNewProjectSchema.parseAsync(input);
}
