"use server";

import {
  type Credential,
  type CredentialsEndpoints,
  type RevealedCredential,
} from "@shared/types/src/api-client/credentials-endpoints";
import {
  type CreateCredentialSchemaType,
  validateCredentialInput,
} from "@/schemas/credential";
import { CredentialsService } from "@/actions/credentials/credentials-service";

/**
 * Creates a new credential
 */
export async function createCredentialFunction(
  form: Readonly<CreateCredentialSchemaType>,
): Promise<Credential> {
  // Validate input before processing
  const validatedForm = await validateCredentialInput(form);
  return CredentialsService.createCredential(validatedForm);
}

/**
 * Deletes a credential
 */
export async function deleteCredentialFunction(
  request: Readonly<CredentialsEndpoints["deleteCredential"]["request"]>,
): Promise<Credential> {
  return CredentialsService.deleteCredential(request);
}

/**
 * Fetches all user credentials
 */
export async function getUserCredentials(): Promise<Credential[]> {
  return CredentialsService.getUserCredentials();
}

/**
 * Fetch the revealed value of a credential
 */
export async function getRevealedCredentialValue(
  credentialId: number,
): Promise<RevealedCredential> {
  return CredentialsService.getRevealedCredentialValue(credentialId);
}
