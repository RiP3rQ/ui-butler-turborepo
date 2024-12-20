import type { CodeType } from "@repo/types";

export interface FavoriteComponentRequest {
  projectId: number;
  componentId: number;
  favoriteValue: boolean;
}

export interface GenerateCodeRequest {
  componentId: number;
  codeType: CodeType;
}

export interface UpdateComponentCodeRequest {
  componentId: number;
  codeType: CodeType;
  content: string;
}

export interface GetSingleComponentRequest {
  projectId: string;
  componentId: string;
}
