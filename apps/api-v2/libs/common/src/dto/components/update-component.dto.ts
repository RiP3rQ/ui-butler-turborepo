import { IsNotEmpty, IsString } from "class-validator";

export class UpdateComponentCodeDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
