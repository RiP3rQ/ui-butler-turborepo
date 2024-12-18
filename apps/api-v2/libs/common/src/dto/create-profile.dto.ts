import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProfileDto {
  @IsNumber()
  age: number;

  @IsString()
  biography: string;

  @IsString()
  @IsNotEmpty()
  userId: number;
}
