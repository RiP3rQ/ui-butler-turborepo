import { type CodeType } from "../others/code-types";
import { type ProtoTimestamp } from "../others/proto-timestamp";

export interface Component {
  id: number;
  title: string;
  code: string;
  // Project
  projectId: number;
  projectName: string;
  // Dates
  createdAt?: ProtoTimestamp | undefined;
  updatedAt?: ProtoTimestamp | undefined;
  // User
  userId: number;
  // Unit Tests
  wasUnitTested: boolean;
  unitTests: string;
  // E2E Tests
  wasE2eTested: boolean;
  e2eTests: string;
  // MDX Docs
  hasMdxDocs: boolean;
  mdxDocs: string;
  // Typescript Docs
  hasTypescriptDocs: boolean;
  tsDocs: string;
}

export interface ComponentsEndpoints {
  /** GET /components/:projectId/:componentId */
  getComponent: {
    params: {
      projectId: number;
      componentId: number;
    };
    body: {
      user: {
        id: number;
        email: string;
      };
    };
    response: Component;
    request: {
      projectId: number;
      componentId: number;
    };
  };

  /** POST /components */
  saveComponent: {
    body: {
      title: string;
      code: string;
      projectId: number;
    };
    response: Component;
    request: {
      title: string;
      code: string;
      projectId: number;
    };
  };

  /** POST /components/favorite */
  favoriteComponent: {
    body: {
      projectId: number;
      componentId: number;
      favoriteValue: boolean;
    };
    response: Component;
    request: {
      projectId: number;
      componentId: number;
      favoriteValue: boolean;
    };
  };

  /** ALL /components/generate */
  generate: {
    body: {
      prompt: string;
    };
    response: {
      content: string;
    };
  };

  /** PATCH /components/:componentId/:codeType */
  updateComponentCode: {
    params: {
      componentId: number;
      codeType: CodeType;
    };
    body: {
      content: string;
    };
    response: Component;
  };

  /** POST /components/generate-code */
  generateCode: {
    body: {
      componentId: number;
      codeType: CodeType;
    };
    response: Component;
    request: {
      componentId: number;
      codeType: CodeType;
    };
  };
}
