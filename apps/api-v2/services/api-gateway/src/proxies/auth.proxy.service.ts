import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseProxyService } from '../common/base.proxy.service';

@Injectable()
export class AuthProxyService extends BaseProxyService {
  constructor(@Inject('AUTH_SERVICE') client: ClientProxy) {
    super(client, 'AUTH_SERVICE');
  }

  async login(credentials: any) {
    return this.client.send('auth.login', credentials);
  }

  async register(userData: any) {
    return this.client.send('auth.register', userData);
  }
}
