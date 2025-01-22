import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersProto } from '@app/proto';
import { CredentialsService } from './credentials.service';

@Controller()
export class CredentialsController {
  private readonly logger = new Logger(CredentialsController.name);

  constructor(private readonly credentialsService: CredentialsService) {}

  @GrpcMethod('UsersService', 'GetUserCredentials')
  public async getUserCredentials(
    request: UsersProto.GetCredentialsRequest,
  ): Promise<UsersProto.GetCredentialsResponse> {
    this.logger.debug('Getting user credentials');
    return await this.credentialsService.getUserCredentials(request);
  }

  @GrpcMethod('UsersService', 'CreateCredential')
  public async createCredential(
    request: UsersProto.CreateCredentialRequest,
  ): Promise<UsersProto.Credential> {
    this.logger.debug('Creating credential');
    return await this.credentialsService.createCredential(request);
  }

  @GrpcMethod('UsersService', 'DeleteCredential')
  public async deleteCredential(
    request: UsersProto.DeleteCredentialRequest,
  ): Promise<UsersProto.Credential> {
    this.logger.debug('Deleting credential');
    return await this.credentialsService.deleteCredential(request);
  }

  @GrpcMethod('UsersService', 'RevealCredential')
  public async revealCredential(
    request: UsersProto.RevealCredentialRequest,
  ): Promise<UsersProto.RevealedCredential> {
    this.logger.debug('Revealing credential');
    return await this.credentialsService.revealCredential(request);
  }
}
