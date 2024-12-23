import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { type ClientGrpc } from "@nestjs/microservices";
import { UsersServiceClient } from "../types/grpc-clients.interface";
import { UsersProto } from "@app/proto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  private usersService: UsersServiceClient;

  constructor(
    configService: ConfigService,
    @Inject("USERS_SERVICE") private readonly client: ClientGrpc,
  ) {
    super({
      clientID: configService.getOrThrow("GOOGLE_AUTH_CLIENT_ID"),
      clientSecret: configService.getOrThrow("GOOGLE_AUTH_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow("GOOGLE_AUTH_REDIRECT_URI"),
      scope: ["profile", "email"],
    });
  }

  onModuleInit() {
    this.usersService =
      this.client.getService<UsersServiceClient>("UsersService");
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      displayName: string;
      emails: { value: string }[];
      photos: { value: string }[];
    },
  ) {
    try {
      const createUserDto: UsersProto.CreateUserDto = {
        $type: "api.users.CreateUserDto",
        email: profile.emails[0]?.value || "",
        password: "",
        username: profile.displayName,
      };

      console.log("Creating/Getting Google user:", {
        email: createUserDto.email,
      });

      const user = await firstValueFrom(
        this.usersService.getOrCreateUser(createUserDto),
      );

      if (!user) {
        throw new Error("Failed to create/get user");
      }

      return user;
    } catch (error) {
      console.error("Google strategy error:", error);
      throw error;
    }
  }
}
