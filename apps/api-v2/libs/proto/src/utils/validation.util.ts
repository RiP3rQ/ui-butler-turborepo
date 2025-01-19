import { validate, type ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";

export class ValidationUtil {
  static async validateDTO<T extends object>(
    data: any,
    dto: new () => T,
  ): Promise<T> {
    const instance = plainToClass(dto, data);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: this.formatValidationErrors(errors),
      });
    }

    return instance;
  }

  static async validateResponse<T extends object>(
    data: any,
    dto: new () => T,
  ): Promise<T> {
    const instance = plainToClass(dto, data);
    const errors = await validate(instance);

    if (errors.length > 0) {
      throw new RpcException({
        code: status.INTERNAL,
        message: "Response validation failed",
        details: this.formatValidationErrors(errors),
      });
    }

    return instance;
  }

  private static formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map((error) => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        if (error.children) {
          return this.formatValidationErrors(error.children);
        }
        return [];
      })
      .flat()
      .join(", ");
  }
}
