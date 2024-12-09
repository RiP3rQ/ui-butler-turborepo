import { IsNotEmpty, IsString } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  title: string = '';

  @IsString()
  @IsNotEmpty()
  projectId: string = '';

  @IsString()
  @IsNotEmpty()
  code: string = '';
}
