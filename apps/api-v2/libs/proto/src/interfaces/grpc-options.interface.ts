export interface GrpcOptions {
  package: string;
  protoPath: string;
  url?: string;
  maxRetries?: number;
  timeout?: number;
  loader?: {
    keepCase?: boolean;
    longs?: string;
    enums?: string;
    defaults?: boolean;
    oneofs?: boolean;
  };
}
