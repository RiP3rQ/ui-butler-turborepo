import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsNumber()
  age: number = 0;

  @IsString()
  biography: string = '';

  @IsString()
  @IsNotEmpty()
  userId: number = 0;
}
