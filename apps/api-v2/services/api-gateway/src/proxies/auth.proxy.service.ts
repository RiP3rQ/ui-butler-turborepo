// auth.proxy.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto, User } from '@app/common';

@Injectable()
export class AuthProxyService {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  async login(data: { user: User }) {
    return firstValueFrom(this.client.send('auth.login', data));
  }

  async register(data: { user: CreateUserDto }) {
    return firstValueFrom(this.client.send('auth.register', data));
  }

  async refresh(data: { user: User }) {
    return firstValueFrom(this.client.send('auth.refresh', data));
  }

  async googleCallback(data: { user: User }) {
    return firstValueFrom(this.client.send('auth.google.callback', data));
  }

  async githubCallback(data: { user: User }) {
    return firstValueFrom(this.client.send('auth.github.callback', data));
  }
}
