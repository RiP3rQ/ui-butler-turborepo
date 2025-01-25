import { ComponentsProto } from "@microservices/proto";
import { type CodeType, codeTypeValues } from "@shared/types";
import { IsIn, IsNotEmpty, IsNumber } from "class-validator";

const codeTypeToProtoMap: Record<CodeType, ComponentsProto.CodeType> = {
  code: ComponentsProto.CodeType.CODE,
  typescriptDocs: ComponentsProto.CodeType.TYPESCRIPT_DOCS,
  unitTests: ComponentsProto.CodeType.UNIT_TESTS,
  e2eTests: ComponentsProto.CodeType.E2E_TESTS,
  mdxDocs: ComponentsProto.CodeType.MDX_DOCS,
};

export class GenerateCodeDto {
  @IsNumber()
  @IsNotEmpty()
  componentId: number = 0;

  @IsIn(codeTypeValues, {
    message: `codeType must be one of: ${codeTypeValues.join(", ")}`,
  })
  @IsNotEmpty()
  codeType!: CodeType;

  /**
   * Converts the validated CodeType to its corresponding Proto enum value
   */
  toProto(): { componentId: number; codeType: ComponentsProto.CodeType } {
    return {
      componentId: this.componentId,
      codeType: codeTypeToProtoMap[this.codeType],
    };
  }
}
