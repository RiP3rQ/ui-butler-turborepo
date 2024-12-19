import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { TokenPayload } from "../types/token-payload.interface";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh", // Make sure this matches exactly
) {
  constructor(
    configService: ConfigService,
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Refresh,
      ]),
      secretOrKey: configService.getOrThrow("JWT_REFRESH_TOKEN_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    try {
      const response = await firstValueFrom(
        this.authClient.send("auth.verify-refresh-token", {
          refreshToken: request.cookies?.Refresh,
          email: payload.email,
        }),
      );

      if (!response) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return response;
    } catch (error) {
      console.error("Refresh token validation error:", error);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
