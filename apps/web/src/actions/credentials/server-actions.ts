"use server";

import type { UserCredentials } from "@repo/types";
import {
  type CreateCredentialSchemaType,
  validateCredentialInput,
} from "@/schemas/credential";
import { CredentialsService } from "@/actions/credentials/credentials-service";
import { type DeleteCredentialRequest } from "@/actions/credentials/types";

/**
 * Creates a new credential
 */
export async function createCredentialFunction(
  form: Readonly<CreateCredentialSchemaType>,
): Promise<UserCredentials> {
  // Validate input before processing
  const validatedForm = await validateCredentialInput(form);
  return CredentialsService.createCredential(validatedForm);
}

/**
 * Deletes a credential
 */
export async function deleteCredentialFunction(
  request: Readonly<DeleteCredentialRequest>,
): Promise<UserCredentials> {
  return CredentialsService.deleteCredential(request);
}

/**
 * Fetches all user credentials
 */
export async function getUserCredentials(): Promise<UserCredentials[]> {
  return CredentialsService.getUserCredentials();
}

/**
 * Fetch the revealed value of a credential
 */
export async function getRevealedCredentialValue(
  credentialId: number,
): Promise<string> {
  return CredentialsService.getRevealedCredentialValue(credentialId);
}
