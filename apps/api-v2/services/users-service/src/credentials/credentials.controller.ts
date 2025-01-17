import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CredentialsService } from './credentials.service';
import { UsersProto } from '@app/proto';

@Controller()
export class CredentialsController {
  private readonly logger = new Logger(CredentialsController.name);

  constructor(private readonly credentialsService: CredentialsService) {}

  @GrpcMethod('UsersService', 'GetUserCredentials')
  async getUserCredentials(
    request: UsersProto.GetCredentialsRequest,
  ): Promise<UsersProto.GetCredentialsResponse> {
    this.logger.debug('Getting user credentials');
    const credentials = await this.credentialsService.getUserCredentials(
      request.user,
    );
    return {
      $type: 'api.users.GetCredentialsResponse',
      credentials: credentials.map((cred) => ({
        ...cred,
        $type: 'api.users.Credential',
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(cred.createdAt.getTime() / 1000),
          nanos: (cred.createdAt.getTime() % 1000) * 1000000,
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(cred.updatedAt.getTime() / 1000),
          nanos: (cred.updatedAt.getTime() % 1000) * 1000000,
        },
      })),
    };
  }

  @GrpcMethod('UsersService', 'CreateCredential')
  async createCredential(
    request: UsersProto.CreateCredentialRequest,
  ): Promise<UsersProto.Credential> {
    this.logger.debug('Creating credential');
    const credential = await this.credentialsService.createCredential(
      request.user,
      request.credential,
    );
    return {
      ...credential,
      $type: 'api.users.Credential',
      createdAt: {
        $type: 'google.protobuf.Timestamp',
        seconds: Math.floor(credential.createdAt.getTime() / 1000),
        nanos: (credential.createdAt.getTime() % 1000) * 1000000,
      },
      updatedAt: {
        $type: 'google.protobuf.Timestamp',
        seconds: Math.floor(credential.updatedAt.getTime() / 1000),
        nanos: (credential.updatedAt.getTime() % 1000) * 1000000,
      },
    };
  }

  @GrpcMethod('UsersService', 'DeleteCredential')
  async deleteCredential(
    request: UsersProto.DeleteCredentialRequest,
  ): Promise<UsersProto.Credential> {
    this.logger.debug('Deleting credential');
    const credential = await this.credentialsService.deleteCredential(
      request.user,
      request.id,
    );
    return {
      ...credential,
      $type: 'api.users.Credential',
      createdAt: {
        $type: 'google.protobuf.Timestamp',
        seconds: Math.floor(credential.createdAt.getTime() / 1000),
        nanos: (credential.createdAt.getTime() % 1000) * 1000000,
      },
      updatedAt: {
        $type: 'google.protobuf.Timestamp',
        seconds: Math.floor(credential.updatedAt.getTime() / 1000),
        nanos: (credential.updatedAt.getTime() % 1000) * 1000000,
      },
    };
  }

  @GrpcMethod('UsersService', 'RevealCredential')
  async revealCredential(
    request: UsersProto.RevealCredentialRequest,
  ): Promise<UsersProto.RevealCredentialResponse> {
    return await this.credentialsService.revealCredential(
      request.user,
      request.id,
    );
  }
}
