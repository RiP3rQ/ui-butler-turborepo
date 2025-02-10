import { join } from 'node:path';
import { type ClientOptions, Transport } from '@nestjs/microservices';

export const createGrpcOptions = (
  host: string,
  port: number,
  package_name: string,
  proto_name: string,
): ClientOptions => ({
  transport: Transport.GRPC,
  options: {
    package: package_name,
    protoPath: join(
      __dirname,
      `../../../../libs/proto/src/proto/${proto_name}.proto`,
    ),
    url: `${host}:${String(port)}`,
    loader: {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    },
    maxReceiveMessageLength: 1024 * 1024 * 10,
    maxSendMessageLength: 1024 * 1024 * 10,
  },
});
