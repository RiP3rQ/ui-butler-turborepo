import { status } from "@grpc/grpc-js";

export interface GrpcError extends Error {
  code?: status;
  details?: string;
  metadata?: any;
}
