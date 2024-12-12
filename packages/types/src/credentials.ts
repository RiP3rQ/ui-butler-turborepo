export interface UserCredentials {
  userId: number;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDecryptedCredentials extends UserCredentials {
  value: string;
}
