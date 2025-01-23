// local.strategy.ts
import { AuthProto } from "@microservices/proto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { firstValueFrom } from "rxjs";
import { AuthServiceClient } from "../types/grpc-clients.interface";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private authService: AuthServiceClient;

  constructor(@Inject("AUTH_SERVICE") private readonly client: ClientGrpc) {
    super({
      usernameField: "email",
    });
  }

  onModuleInit(): void {
    this.authService = this.client.getService<AuthServiceClient>("AuthService");
  }

  async validate(email: string, password: string): Promise<AuthProto.User> {
    try {
      if (!email || !password) {
        throw new UnauthorizedException("Email and password are required");
      }

      const request: AuthProto.VerifyUserRequest = {
        $type: "api.auth.VerifyUserRequest",
        email,
        password,
      };

      console.log("Attempting to verify user:", { email });

      // Convert Observable to Promise using firstValueFrom
      const user = await firstValueFrom(this.authService.verifyUser(request));

      console.log("User verified:", user);

      if (!user.id || !user.email) {
        throw new UnauthorizedException("Invalid credentials");
      }

      return user;
    } catch (error) {
      console.error("Validation error:", error);
      throw new UnauthorizedException("Invalid credentials");
    }
  }
}
