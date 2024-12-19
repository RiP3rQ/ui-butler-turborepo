import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  value: string;
}
