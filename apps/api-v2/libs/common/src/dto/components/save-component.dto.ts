import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SaveComponentDto {
  @IsString()
  @IsNotEmpty()
  title = "";

  @IsNumber()
  @IsNotEmpty()
  projectId = 0;

  @IsString()
  @IsNotEmpty()
  code = "";
}
