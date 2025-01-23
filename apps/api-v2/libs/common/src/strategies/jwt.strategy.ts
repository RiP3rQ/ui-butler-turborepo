// libs/common/src/strategies/jwt.strategy.ts
import { UsersProto } from "@microservices/proto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type ClientGrpc } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { firstValueFrom } from "rxjs";
import { UsersServiceClient } from "../types/grpc-clients.interface";
import { TokenPayload } from "../types/token-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private usersService: UsersServiceClient;

  constructor(
    configService: ConfigService,
    @Inject("USERS_SERVICE") private readonly client: ClientGrpc,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => String(request.cookies.Authentication),
      ]),
      secretOrKey: String(configService.getOrThrow("JWT_ACCESS_TOKEN_SECRET")),
    });
  }

  onModuleInit(): void {
    this.usersService =
      this.client.getService<UsersServiceClient>("UsersService");
  }

  async validate(payload: TokenPayload): Promise<UsersProto.User> {
    try {
      const request: UsersProto.GetUserByEmailRequest = {
        $type: "api.users.GetUserByEmailRequest",
        email: payload.email,
      };

      const user = await firstValueFrom(
        this.usersService.getUserByEmail(request),
      );

      if (typeof user === "undefined") {
        throw new UnauthorizedException("User not found");
      }

      return user;
    } catch (error) {
      console.error("JWT validation error:", error);
      throw new UnauthorizedException("Invalid token");
    }
  }
}
