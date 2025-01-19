import { IsNotEmpty, IsString } from "class-validator";

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name = "";

  @IsString()
  @IsNotEmpty()
  description = "";
}
