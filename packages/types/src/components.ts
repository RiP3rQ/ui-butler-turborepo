export interface ComponentType {
  id: number;
  userId: number;
  title: string;
  projectId: number;
  code: string;
  e2eTests: string;
  unitTests: string;
  mdxDocs: string;
  tsDocs: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SingleComponentApiResponseType {
  id: number;
  userId: number;
  title: string;
  projectId: number;
  code: string;
  createdAt: Date;
  updatedAt: Date;

  // Project
  projectName: string;

  // Typescript description
  hasTypescriptDocs: boolean;
  typescriptDocsCode?: string;

  // Unit Tests
  wasUnitTested: boolean;
  unitTestsCode?: string;

  // E2E Tests
  wasE2ETested: boolean;
  e2eTestsCode?: string;

  // Storybook
  hasStorybook: boolean;
  storybookCode?: string;
}

export const codeTypeValues = [
  "code",
  "typescriptDocs",
  "unitTests",
  "e2eTests",
  "mdxDocs",
] as const;
export type CodeType = (typeof codeTypeValues)[number];
