import { type ProtoTimestamp } from "../others/proto-timestamp";

export interface Credential {
  id: number;
  name: string;
  type: string;
  value: string;
  createdAt: ProtoTimestamp;
  updatedAt: ProtoTimestamp;
}

export interface RevealedCredential {
  id: number;
  value: string;
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

export interface CredentialsEndpoints {
  /** GET /credentials */
  getUserCredentials: {
    response: Credential[];
  };

  /** POST /credentials */
  createCredential: {
    body: {
      name: string;
      value: string;
    };
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
