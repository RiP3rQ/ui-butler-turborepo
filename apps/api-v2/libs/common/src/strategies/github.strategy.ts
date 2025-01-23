// libs/common/src/strategies/github.strategy.ts
import { UsersProto } from "@microservices/proto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type ClientGrpc } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { firstValueFrom } from "rxjs";
import { UsersServiceClient } from "../types/grpc-clients.interface";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  private usersService: UsersServiceClient;

  constructor(
    configService: ConfigService,
    @Inject("USERS_SERVICE") private readonly client: ClientGrpc,
  ) {
    super({
      clientID: String(configService.getOrThrow("GITHUB_AUTH_CLIENT_ID")),
      clientSecret: String(
        configService.getOrThrow("GITHUB_AUTH_CLIENT_SECRET"),
      ),
      callbackURL: String(configService.getOrThrow("GITHUB_AUTH_REDIRECT_URI")),
      scope: ["user:email"],
    });
  }

  onModuleInit(): void {
    this.usersService =
      this.client.getService<UsersServiceClient>("UsersService");
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      username: string;
      avatar_url: string;
      emails: { value: string }[];
    },
  ): Promise<UsersProto.User> {
    const email = profile.emails[0]?.value;

    if (!email) {
      throw new UnauthorizedException("Email not provided by GitHub");
    }

    try {
      const createUserDto: UsersProto.CreateUserDto = {
        $type: "api.users.CreateUserDto",
        email,
        password: "",
        username: profile.username,
      };

      console.log("Creating/Getting GitHub user:", { email });

      const user: UsersProto.User | undefined = await firstValueFrom(
        this.usersService.getOrCreateUser(createUserDto),
      );

      if (typeof user === "undefined") {
        throw new Error("Failed to create/get user");
      }

      return user;
    } catch (error) {
      console.error("GitHub strategy error:", error);
      throw error;
    }
  }
}
