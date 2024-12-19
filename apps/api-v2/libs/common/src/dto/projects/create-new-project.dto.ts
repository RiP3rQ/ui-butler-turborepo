import { IsNotEmpty, IsString } from "class-validator";

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string = "";

  @IsString()
  @IsNotEmpty()
  color: string = "";

  @IsString()
  description: string = "";
}
