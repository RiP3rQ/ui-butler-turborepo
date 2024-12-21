import 'reflect-metadata';

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
  Transport: {
    TCP: 'TCP',
  },
  ClientsModule: {
    registerAsync: jest.fn().mockReturnValue({
      module: class MockClientsModule {},
      providers: [],
    }),
  },
}));
