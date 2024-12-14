import { IsNotEmpty, IsString } from 'class-validator';

export class SaveComponentDto {
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
