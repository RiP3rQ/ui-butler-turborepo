import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApproveChangesDto {
  @IsString()
  @IsNotEmpty()
  decision: string = '';

  @IsNumber()
  @IsNotEmpty()
  componentId: number = 0;
}
