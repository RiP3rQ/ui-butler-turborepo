import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ApproveChangesDto {
  @IsBoolean()
  @IsNotEmpty()
  approve: boolean = false;
}
