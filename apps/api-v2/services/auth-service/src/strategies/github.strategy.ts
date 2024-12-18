import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    configService: ConfigService,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {
    super({
      clientID: configService.getOrThrow('GITHUB_AUTH_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GITHUB_AUTH_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GITHUB_AUTH_REDIRECT_URI'),
      scope: ['user:email'], //'public_profile'
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      username: string;
      avatar_url: string;
      emails: { value: string }[];
    },
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Email not provided by GitHub');
    }

    const username = profile.username;

    // Instead of direct UsersService call, use the microservice
    return await firstValueFrom(
      this.usersClient.send('users.get.or.create', {
        email,
        password: '',
        username,
      }),
    );
  }
}
