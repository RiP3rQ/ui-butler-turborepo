import { redirect } from "next/navigation";
import { toast } from "sonner";
import { getProjectsDetailsFunction } from "@/actions/projects/get-project-details";
import { ProjectCard } from "@/components/project-viewer/project-card";

type Params = Promise<{ projectId: string }>;
export default async function SingleProjectPage({
  params,
}: Readonly<{
  params: Params;
}>): Promise<JSX.Element> {
  const { projectId } = await params;

  if (!projectId) {
    return redirect("/dashboard");
  }

  const projectData = await getProjectsDetailsFunction({
    projectId,
  });

  if (!projectData) {
    toast.error("Project not found");
    return redirect("/dashboard");
  }

  return <ProjectCard projectData={projectData} projectId={projectId} />;
}
