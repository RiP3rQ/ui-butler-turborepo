import { z } from "zod";

export const createCredentialSchema = z.object({
  name: z.string().min(1).max(30),
  value: z.string().min(1).max(1000),
});
export type CreateCredentialSchemaType = z.infer<typeof createCredentialSchema>;

export async function validateCredentialInput(
  input: CreateCredentialSchemaType,
): Promise<CreateCredentialSchemaType> {
  return createCredentialSchema.parseAsync(input);
}
