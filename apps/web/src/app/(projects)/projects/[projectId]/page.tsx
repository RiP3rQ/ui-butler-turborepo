import { getProjectsDetailsFunction } from "@/actions/projects/server-actions";
import { ProjectCard } from "@/components/project-viewer/project-card";
import { redirect } from "next/navigation";
import { type JSX } from "react";
import { toast } from "sonner";

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
