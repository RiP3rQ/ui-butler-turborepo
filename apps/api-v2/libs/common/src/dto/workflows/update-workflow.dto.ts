import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateWorkflowDto {
  @IsNumber()
  @IsNotEmpty()
  workflowId: number = 0;

  @IsString()
  @IsNotEmpty()
  definition: string = "";
}
