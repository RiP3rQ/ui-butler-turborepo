import { IsIn, IsNotEmpty, IsNumber } from "class-validator";
import { codeTypeValues } from "@repo/types";
import { ComponentsProto } from "@app/proto";

export class GenerateCodeDto {
  @IsNumber()
  @IsNotEmpty()
  componentId: number;

  @IsIn(codeTypeValues, {
    message: `codeType must be one of: ${codeTypeValues.join(", ")}`,
  })
  @IsNotEmpty()
  codeType: ComponentsProto.CodeType;
}
