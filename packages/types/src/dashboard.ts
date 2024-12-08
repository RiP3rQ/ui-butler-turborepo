export type DashboardStatCardsValuesResponse = {
  currentActiveProjects: number;
  numberOfCreatedComponents: number;
  favoritesComponents: number;
};

export type DashboardGridValuesResponse = {
  iconId: number;
  name: string;
  color: string;
  numberOfComponents: number;
};

export type DashboardTableFavoritedContentResponse = {
  id: number;
  name: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  // TODO: DISPLAY CHECKMARKS FOR THE WORKFLOW TYPES THAT ARE DONE TO THE COMPONENT (e.g. "Tests", "TestsE2E", "Ts docs")
};
