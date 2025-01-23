import { type ProtoTimestamp } from "../others/proto-timestamp";
import { type Component } from "./components-endpoints";
import { type Workflow } from "./workflows-endpoints";

export interface Project {
  id: number;
  title: string;
  description: string;
  color: string;
  createdAt: ProtoTimestamp;
  updatedAt: ProtoTimestamp;
  userId: number;
  numberOfComponents?: number;
}

export interface ProjectDetails extends Project {
  components: Component[];
  workflows: Workflow[];
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
    request: {
      projectId: number;
    };
  };

  /** POST /projects */
  createProject: {
    body: {
      title: string;
      color: string;
      description?: string;
    };
    response: Project;
  };
}
