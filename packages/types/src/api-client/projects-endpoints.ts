export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails extends Project {
  components: {
    id: number;
    title: string;
    createdAt: string;
  }[];
  workflows: {
    id: number;
    name: string;
    createdAt: string;
  }[];
}

export interface ProjectsEndpoints {
  /** GET /projects */
  getProjects: {
    response: Project[];
  };

  /** GET /projects/:projectId */
  getProjectDetails: {
    params: {
      projectId: number;
    };
    response: ProjectDetails;
  };

  /** POST /projects */
  createProject: {
    body: {
      name: string;
      description: string;
    };
    response: Project;
  };
}
