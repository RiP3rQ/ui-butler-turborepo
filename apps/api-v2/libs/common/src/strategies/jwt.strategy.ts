// libs/common/src/strategies/jwt.strategy.ts
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../types/token-payload.interface";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import { UsersServiceClient } from "../types/grpc-clients.interface";
import { UsersProto } from "@app/proto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private usersService: UsersServiceClient;

  constructor(
    configService: ConfigService,
    @Inject("USERS_SERVICE") private readonly client: ClientGrpc,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: configService.getOrThrow("JWT_ACCESS_TOKEN_SECRET"),
    });
  }

  onModuleInit() {
    this.usersService =
      this.client.getService<UsersServiceClient>("UsersService");
  }

  async validate(payload: TokenPayload) {
    try {
      const request: UsersProto.GetUserByEmailRequest = {
        $type: "api.users.GetUserByEmailRequest",
        email: payload.email,
      };

      const user = await firstValueFrom(
        this.usersService.getUserByEmail(request),
      );

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return user;
    } catch (error) {
      console.error("JWT validation error:", error);
      throw new UnauthorizedException("Invalid token");
    }
  }
}
