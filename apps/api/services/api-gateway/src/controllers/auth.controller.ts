import { Body, Controller, Post } from '@nestjs/common';
import { AuthProxyService } from '../proxies/auth.proxy.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authProxy: AuthProxyService) {}

  @Post('login')
  async login(@Body() credentials: any) {
    return this.authProxy.login(credentials);
  }

  @Post('register')
  async register(@Body() userData: any) {
    return this.authProxy.register(userData);
  }
}
