import { ProtoTimestamp } from "./proto";

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
