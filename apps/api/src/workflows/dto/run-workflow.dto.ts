import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RunWorkflowDto {
  @IsNumber()
  @IsNotEmpty()
  workflowId: number = 0;

  @IsNumber()
  @IsNotEmpty()
  componentId: number = 0;

  @IsString()
  flowDefinition?: string = '';
}
