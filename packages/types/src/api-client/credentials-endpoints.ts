export interface Credential {
  id: number;
  name: string;
  type: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevealedCredential {
  id: number;
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
      type: string;
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
  };

  /** GET /credentials/:id/reveal */
  revealCredential: {
    params: {
      id: string;
    };
    response: RevealedCredential;
  };
}
