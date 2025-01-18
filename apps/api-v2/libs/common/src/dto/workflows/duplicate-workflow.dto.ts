import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DuplicateWorkflowDto {
  @IsNumber()
  @IsNotEmpty()
  workflowId = 0;

  @IsString()
  @IsNotEmpty()
  name = "";

  @IsString()
  @IsNotEmpty()
  description = "";
}
