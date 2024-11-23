import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string = '';

  @IsString()
  @IsNotEmpty()
  description: string = '';
}
