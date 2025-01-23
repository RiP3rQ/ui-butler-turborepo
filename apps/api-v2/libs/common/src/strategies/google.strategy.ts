import { UsersProto } from "@microservices/proto";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type ClientGrpc } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { firstValueFrom } from "rxjs";
import { UsersServiceClient } from "../types/grpc-clients.interface";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  private usersService: UsersServiceClient;

  constructor(
    configService: ConfigService,
    @Inject("USERS_SERVICE") private readonly client: ClientGrpc,
  ) {
    super({
      clientID: String(configService.getOrThrow("GOOGLE_AUTH_CLIENT_ID")),
      clientSecret: String(
        configService.getOrThrow("GOOGLE_AUTH_CLIENT_SECRET"),
      ),
      callbackURL: String(configService.getOrThrow("GOOGLE_AUTH_REDIRECT_URI")),
      scope: ["profile", "email"],
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
      displayName: string;
      emails: { value: string }[];
      photos: { value: string }[];
    },
  ): Promise<UsersProto.User> {
    try {
      const createUserDto: UsersProto.CreateUserDto = {
        $type: "api.users.CreateUserDto",
        email: profile.emails[0]?.value ?? "",
        password: "",
        username: profile.displayName,
      };

      console.log("Creating/Getting Google user:", {
        email: createUserDto.email,
      });

      const user: UsersProto.User | undefined = await firstValueFrom(
        this.usersService.getOrCreateUser(createUserDto),
      );

      if (typeof user === "undefined") {
        throw new Error("Failed to create/get user");
      }

      return user;
    } catch (error) {
      console.error("Google strategy error:", error);
      throw error;
    }
  }
}
