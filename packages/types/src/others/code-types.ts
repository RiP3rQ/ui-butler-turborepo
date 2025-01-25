export const codeTypeValues = [
  "code",
  "typescriptDocs",
  "unitTests",
  "e2eTests",
  "mdxDocs",
] as const;
export type CodeType = (typeof codeTypeValues)[number];

export const protoCodeTypeToEnumMap: Record<number, CodeType> = {
  0: "code",
  1: "typescriptDocs",
  2: "unitTests",
  3: "e2eTests",
  4: "mdxDocs",
};
