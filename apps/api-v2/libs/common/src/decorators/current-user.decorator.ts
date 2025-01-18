import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

const getCurrentUserByContext = (context: ExecutionContext): User => {
  const request = context.switchToHttp().getRequest<Request>();
  if (!request.user) {
    throw new Error("User not found in request");
  }
  return request.user as User;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User =>
    getCurrentUserByContext(context),
);
