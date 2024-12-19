import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../types/token-payload.interface";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: configService.getOrThrow("JWT_ACCESS_TOKEN_SECRET"),
    });
  }

  async validate(payload: TokenPayload) {
    // Instead of direct UsersService call, use the microservice
    return await firstValueFrom(
      this.usersClient.send("users.get.by.email", payload),
    );
  }
}
