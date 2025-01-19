import { IsNotEmpty, IsString } from "class-validator";

export class SaveComponentDto {
  @IsString()
  @IsNotEmpty()
  title = "";

  @IsString()
  @IsNotEmpty()
  projectId = "";

  @IsString()
  @IsNotEmpty()
  code = "";
}
