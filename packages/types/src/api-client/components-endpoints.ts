import { CodeType } from "../index";

export interface Component {
  id: number;
  title: string;
  code: string;
  projectId: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentsEndpoints {
  /** GET /components/:projectId/:componentId */
  getComponent: {
    params: {
      projectId: number;
      componentId: number;
    };
    response: Component;
  };

  /** POST /components */
  saveComponent: {
    body: {
      title: string;
      code: string;
      projectId: number;
    };
    response: Component;
  };

  /** POST /components/favorite */
  favoriteComponent: {
    body: {
      projectId: number;
      componentId: number;
      favoriteValue: boolean;
    };
    response: Component;
  };

  /** ALL /components/generate */
  generate: {
    response: {
      success: boolean;
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
  };
}
