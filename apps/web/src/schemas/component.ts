import { z } from "zod";

export const saveComponentSchema = z.object({
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
  code: z
    .string()
    .min(1, {
      message: "Code is required",
    })
    .max(9999, {
      message: "Code should be less than 10000 characters",
    }),
});
export type SaveComponentSchemaType = z.infer<typeof saveComponentSchema>;

export async function validateComponentInput(
  input: SaveComponentSchemaType,
): Promise<SaveComponentSchemaType> {
  return saveComponentSchema.parseAsync(input);
}

export const generateComponentSchema = z.object({
  prompt: z
    .string()
    .min(1, {
      message: "Prompt is required",
    })
    .max(1999, {
      message: "Prompt should be less than 2000 characters",
    }),
});
export type GenerateComponentSchemaType = z.infer<
  typeof generateComponentSchema
>;
