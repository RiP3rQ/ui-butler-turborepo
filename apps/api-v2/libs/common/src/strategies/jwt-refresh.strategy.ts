// libs/common/src/strategies/jwt-refresh.strategy.ts
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { type ClientGrpc } from "@nestjs/microservices";
import { AuthProto } from "@app/proto";
import { firstValueFrom } from "rxjs";
import { AuthServiceClient } from "../types/grpc-clients.interface";

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
        (request: Request) => request.cookies.Refresh as string,
      ]),
      secretOrKey: String(configService.getOrThrow("JWT_REFRESH_TOKEN_SECRET")),
      passReqToCallback: true,
    });
  }

  onModuleInit(): void {
    this.authService = this.client.getService<AuthServiceClient>("AuthService");
  }

  async validate(
    request: Request,
    payload: { email: string },
  ): Promise<AuthProto.User> {
    try {
      console.log("Validating refresh token:", {
        email: payload.email,
        refreshToken: `${String(request.cookies.Refresh).slice(0, 20)}...`,
      });

      const verifyRequest: AuthProto.VerifyRefreshTokenRequest = {
        $type: "api.auth.VerifyRefreshTokenRequest",
        refreshToken: String(request.cookies.Refresh),
        email: payload.email,
      };

      const user = await firstValueFrom(
        this.authService.verifyRefreshToken(verifyRequest),
      );

      if (!user.id || !user.email) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return user;
    } catch (error) {
      console.error("Refresh token validation error:", error);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
