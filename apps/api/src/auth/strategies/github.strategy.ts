import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
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
    profile: Profile,
  ) {
    console.log('profile', profile);
    // const email = profile.emails?.[0]?.value;

    // if (!email) {
    //   throw new UnauthorizedException('Email not provided by GitHub');
    // }

    return await this.usersService.getOrCreateUser({
      email: 'test@gmail.com',
      password: '',
      // githubId: profile.id,
      // name: profile.displayName || profile.username,
      // avatar: profile.photos?.[0]?.value,
    });
  }
}
