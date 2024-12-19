import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto, User } from '@app/common';

@Controller()
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @MessagePattern('credentials.get')
  async getUserCredentials(@Payload() data: { user: User }) {
    return this.credentialsService.getUserCredentials(data.user);
  }

  @MessagePattern('credentials.create')
  async createCredential(
    @Payload() data: { user: User; createCredentialDto: CreateCredentialDto },
  ) {
    return this.credentialsService.createCredential(
      data.user,
      data.createCredentialDto,
    );
  }

  @MessagePattern('credentials.delete')
  async deleteCredential(@Payload() data: { user: User; id: number }) {
    return this.credentialsService.deleteCredential(data.user, data.id);
  }
}
