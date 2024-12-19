import { IsNotEmpty, IsString } from "class-validator";

export class ApproveChangesDto {
  @IsString()
  @IsNotEmpty()
  decision: string;
}
