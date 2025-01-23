import { type ProtoTimestamp } from "../others/proto-timestamp";

export interface Credential {
  id: number;
  name: string;
  userId: number;
  createdAt: ProtoTimestamp;
  updatedAt: ProtoTimestamp;
}

export interface RevealedCredential {
  id: number;
  name: string;
  value: string;
  userId: number;
  createdAt: ProtoTimestamp;
  updatedAt: ProtoTimestamp;
}

export interface UserCredentials {
  userId: number;
  id: number;
  name: string;
  createdAt: ProtoTimestamp;
  updatedAt: ProtoTimestamp;
}

export interface UserDecryptedCredentials extends UserCredentials {
  value: string;
}

export interface CreateCredentialDto {
  name: string;
  value: string;
}

export interface CredentialsEndpoints {
  /** GET /credentials */
  getUserCredentials: {
    response: Credential[];
  };

  /** POST /credentials */
  createCredential: {
    body: CreateCredentialDto;
    response: Credential;
  };

  /** DELETE /credentials */
  deleteCredential: {
    query: {
      id: string;
    };
    response: Credential;
    request: {
      id: number;
    };
  };

  /** GET /credentials/:id/reveal */
  revealCredential: {
    params: {
      id: string;
    };
    response: RevealedCredential;
  };
}
