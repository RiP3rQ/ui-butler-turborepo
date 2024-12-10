import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import moment from "moment/moment";
import { toast } from "sonner";
import { getProjectsDetailsFunction } from "@/actions/projects/get-project-details";
import { MultipleComponentsView } from "@/components/component-viewer/multiple-component-view";

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

  const componentsData = await getProjectsDetailsFunction({
    projectId,
  });

  if (!componentsData) {
    toast.error("Project not found");
    return redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)] w-full max-w-full px-8 py-4">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>
            <div className="w-full flex justify-center flex-col">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-4xl flex items-center justify-center">
                  <div
                    className="size-7 rounded-full mr-2"
                    style={{
                      backgroundColor: componentsData.color,
                    }}
                  />
                  {componentsData.title}
                </Label>
              </div>
              <Label className="text-muted-foreground text-xl">
                <span className="text-sm">{componentsData.description}</span>
              </Label>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between w-full space-x-4">
              <div>
                Created at:{" "}
                <span>
                  {moment(componentsData.createdAt).format("DD/MM/YYYY")}
                </span>
              </div>
              <div>
                Updated at:{" "}
                <span>
                  {moment(componentsData.updatedAt).format("DD/MM/YYYY")}
                </span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="h-fit w-full">
          <MultipleComponentsView components={componentsData.components} />
        </CardContent>
      </Card>
    </div>
  );
}
