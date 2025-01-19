// jest-setup.ts
import 'reflect-metadata';
import { type RpcException } from '@nestjs/microservices';

// Mock console methods to prevent noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock('@nestjs/microservices', () => ({
  MessagePattern: () => jest.fn(),
  Payload: () => jest.fn(),
  GrpcMethod: () => jest.fn(),
  Transport: {
    GRPC: 'GRPC',
  },
  ClientsModule: {
    registerAsync: jest.fn().mockReturnValue({
      module: class MockClientsModule {},
      providers: [],
    }),
    register: jest.fn().mockReturnValue({
      module: class MockClientsModule {},
      providers: [],
    }),
  },
  RpcException: jest.requireActual<{ RpcException: typeof RpcException }>(
    '@nestjs/microservices',
  ).RpcException,
}));

// Mock grpc-js status codes
jest.mock('@grpc/grpc-js', () => ({
  status: {
    OK: 0,
    CANCELLED: 1,
    UNKNOWN: 2,
    INVALID_ARGUMENT: 3,
    DEADLINE_EXCEEDED: 4,
    NOT_FOUND: 5,
    ALREADY_EXISTS: 6,
    PERMISSION_DENIED: 7,
    UNAUTHENTICATED: 16,
    UNIMPLEMENTED: 12,
    INTERNAL: 13,
  },
  ServiceError: class MockServiceError extends Error {
    public code: number;
    public details: string;

    constructor(code: number, details: string) {
      super(details);
      this.code = code;
      this.details = details;
    }
  },
}));
