import { IsNotEmpty, IsString } from "class-validator";

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title = "";

  @IsString()
  @IsNotEmpty()
  color = "";

  @IsString()
  description = "";
}
