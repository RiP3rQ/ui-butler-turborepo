import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
  ) {
    super({
      usernameField: "email",
    });
  }

  async validate(email: string, password: string) {
    try {
      const user = await firstValueFrom(
        this.authClient.send("auth.verify-user", {
          email,
          password,
        }),
      );

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }
}
