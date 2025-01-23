import { ComponentsProto } from "@microservices/proto";
import { codeTypeValues } from "@shared/types";
import { IsIn, IsNotEmpty, IsNumber } from "class-validator";

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
