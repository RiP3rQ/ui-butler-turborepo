export interface DashboardStatCardsValuesResponse {
  currentActiveProjects: number;
  numberOfCreatedComponents: number;
  favoritesComponents: number;
}

export interface DashboardGridValuesResponse {
  iconId: number;
  name: string;
  color: string;
  numberOfComponents: number;
}

export interface DashboardTableFavoritedContentResponse {
  id: number;
  name: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  // TODO: DISPLAY CHECKMARKS FOR THE WORKFLOW TYPES THAT ARE DONE TO THE COMPONENT (e.g. "Tests", "TestsE2E", "Ts docs")
}
