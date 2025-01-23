import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { type CodeType, codeTypeValues } from '@shared/types';

export class GenerateCodeDto {
  @IsNumber()
  @IsNotEmpty()
  componentId: number;

  @IsIn(codeTypeValues, {
    message: `codeType must be one of: ${codeTypeValues.join(', ')}`,
  })
  @IsNotEmpty()
  codeType: CodeType;
}
