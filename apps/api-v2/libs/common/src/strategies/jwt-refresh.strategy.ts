// jwt-refresh.strategy.ts
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { type ClientGrpc } from "@nestjs/microservices";
import { AuthServiceClient } from "../types/grpc-clients.interface";
import { AuthProto } from "@app/proto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  private authService: AuthServiceClient;

  constructor(
    configService: ConfigService,
    @Inject("AUTH_SERVICE") private readonly client: ClientGrpc,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Refresh,
      ]),
      secretOrKey: configService.getOrThrow("JWT_REFRESH_TOKEN_SECRET"),
      passReqToCallback: true,
    });
  }

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>("AuthService");
  }

  async validate(request: Request, payload: any) {
    try {
      if (!payload?.email) {
        throw new UnauthorizedException("Invalid token payload");
      }

      const verifyRequest: AuthProto.VerifyRefreshTokenRequest = {
        $type: "api.auth.VerifyRefreshTokenRequest",
        refreshToken: request.cookies?.Refresh,
        email: payload.email,
      };

      console.log("Verifying refresh token:", { email: payload.email });

      // Convert Observable to Promise
      const user = await firstValueFrom(
        this.authService.verifyRefreshToken(verifyRequest),
      );

      if (!user || !user.id || !user.email) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return {
        $type: "api.auth.User",
        id: user.id,
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      console.error("Refresh token validation error:", error);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
