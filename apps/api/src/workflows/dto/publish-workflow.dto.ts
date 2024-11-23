import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PublishWorkflowDto {
  @IsNumber()
  @IsNotEmpty()
  workflowId: number = 0;

  @IsString()
  @IsNotEmpty()
  flowDefinition: string = '';
}
