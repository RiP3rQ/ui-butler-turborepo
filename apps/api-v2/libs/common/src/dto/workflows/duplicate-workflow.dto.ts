import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DuplicateWorkflowDto {
  @IsNumber()
  @IsNotEmpty()
  workflowId: number = 0;

  @IsString()
  @IsNotEmpty()
  name: string = "";

  @IsString()
  @IsNotEmpty()
  description: string = "";
}
