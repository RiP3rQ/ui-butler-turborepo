import { IsArray, IsEnum, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class MessageDto {
  @IsEnum(["user", "assistant", "system"])
  role: "user" | "assistant" | "system";

  @IsString()
  content: string;
}

export class GenerateComponentRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}
