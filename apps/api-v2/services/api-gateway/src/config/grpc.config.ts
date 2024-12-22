import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

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
    url: `${host}:${port}`,
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
