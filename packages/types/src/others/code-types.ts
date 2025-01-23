export const codeTypeValues = [
  "code",
  "typescriptDocs",
  "unitTests",
  "e2eTests",
  "mdxDocs",
] as const;
export type CodeType = (typeof codeTypeValues)[number];
