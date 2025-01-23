import { redirect } from "next/navigation";
import { toast } from "sonner";
import { type JSX } from "react";
import { ProjectCard } from "@/components/project-viewer/project-card";
import { getProjectsDetailsFunction } from "@/actions/projects/server-actions";

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

  try {
    const projectData = await getProjectsDetailsFunction({
      projectId: Number(projectId),
    });

    return <ProjectCard projectData={projectData} projectId={projectId} />;
  } catch (e) {
    toast.error("Project not found");
    return redirect("/dashboard");
  }
}
