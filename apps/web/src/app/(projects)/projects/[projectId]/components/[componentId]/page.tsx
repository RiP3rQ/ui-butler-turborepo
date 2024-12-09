import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import moment from "moment";
import { Label } from "@repo/ui/components/ui/label";
import { getSingleComponentsDataFunction } from "@/actions/components/get-single-components-data";
import { SingleComponentView } from "@/components/component-viewer/single-component-view";

type Params = Promise<{ projectId: string; componentId: string }>;
export default async function SingleComponentPage({
  params,
}: Readonly<{
  params: Params;
}>): Promise<JSX.Element> {
  const { projectId, componentId } = await params;

  if (!projectId || !componentId) {
    return redirect("/dashboard");
  }

  const componentsData = await getSingleComponentsDataFunction({
    projectId,
    componentId,
  });

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)] w-full max-w-full px-8 py-4">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>
            <div className="w-full flex items-center justify-between">
              <Label className="underline font-semibold text-4xl">
                {componentsData.title}
              </Label>
              <Label className="text-muted-foreground text-xl">
                <span className="text-sm underline">Project:</span>{" "}
                {componentsData.projectName}
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
          <SingleComponentView componentsData={componentsData} />
        </CardContent>
      </Card>
    </div>
  );
}
