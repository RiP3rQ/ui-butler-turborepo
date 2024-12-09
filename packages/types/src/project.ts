import { ComponentType } from "./components";

export interface ProjectType {
  id: number;
  title: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  numberOfComponents?: number;
}

export interface ProjectDetailsType extends ProjectType {
  components: ComponentType[];
}
