// Re-export with namespaces to avoid conflicts
export { Timestamp } from "./generated/google/protobuf/timestamp";
export * as AuthProto from "./generated/auth";
export * as UsersProto from "./generated/users";
export * as AnalyticsProto from "./generated/analytics";
export * as ProjectsProto from "./generated/projects";
export * as ComponentsProto from "./generated/components";
export * as BillingProto from "./generated/billing";

// Export other utilities
export * from "./constants/grpc.constants";
export * from "./interfaces/grpc-options.interface";
export * from "./interfaces/service-definitions.interface";
export * from "./services/base-grpc.service";
export * from "./utils/type-converter.util";
export * from "./interceptors/grpc-validation.interceptor";
export * from "./decorators/grpc-method.decorator";
