export interface ProjectType {
  id: number;
  title: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}
