"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { type ComponentType, type ProjectDetailsType } from "@repo/types";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/ui/button";
import { NavigationIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type JSX, useState } from "react";
import CodeEditor from "@/components/code-editor/editor";
import { FavoriteButton } from "@/components/components/favorite-button";
import { favoriteComponentFunction } from "@/actions/components/favorite-component";

interface MultipleComponentsViewProps {
  queryKey: string;
  components: ComponentType[];
}

export function MultipleComponentsView({
  queryKey,
  components,
}: Readonly<MultipleComponentsViewProps>): JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mutatingComponentId, setMutatingComponentId] = useState<number | null>(
    null,
  );

  const { mutate } = useMutation({
    mutationFn: favoriteComponentFunction,
    onMutate: async (newFavoritedComponent) => {
      setMutatingComponentId(newFavoritedComponent.componentId);
      await queryClient.cancelQueries({ queryKey: [queryKey] });
      const previousProjectDetails = queryClient.getQueryData([queryKey]);
      queryClient.setQueryData([queryKey], (old: ProjectDetailsType) => ({
        ...old,
        components: old.components.map((component) =>
          component.id === newFavoritedComponent.componentId
            ? { ...component, isFavorite: newFavoritedComponent.favoriteValue }
            : component,
        ),
      }));
      return { previousProjectDetails };
    },
    onSuccess: () => {
      toast.success("Successfully added to favorites", {
        id: "favorite-component",
      });
      setMutatingComponentId(null);
    },
    onError: () => {
      toast.error("Failed to add to favorites", {
        id: "favorite-component",
      });
      setMutatingComponentId(null);
    },
  });

  return (
    <Accordion
      type="multiple"
      className="w-full space-y-2"
      defaultValue={["item-1"]}
    >
      {components.map((component, index) => {
        return (
          <AccordionItem
            key={index}
            value={`component-${String(component.id)}`}
            className="border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative"
          >
            {/* GO TO COMPONENT DETAIL'S BUTTON*/}
            <div className="absolute top-1 right-[70px]">
              <Button
                variant="ghost"
                size="icon"
                className="z-50"
                onClick={() => {
                  router.push(
                    `/projects/${String(component.projectId)}/components/${String(component.id)}`,
                  );
                }}
              >
                <NavigationIcon className="size-6 text-gray-500" />
              </Button>
            </div>
            {/* FAVORITE BUTTON*/}
            <div className="absolute top-1 right-8">
              <FavoriteButton
                isPending={mutatingComponentId === component.id}
                isFavorite={Boolean(component.isFavorite)}
                favoriteHandler={() => {
                  mutate({
                    projectId: component.projectId,
                    componentId: component.id,
                    favoriteValue: !component.isFavorite,
                  });
                }}
              />
            </div>
            {/* ACCORDION */}
            <AccordionTrigger className="px-4 py-3 ">
              <div className="flex items-center w-full">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{component.title}</span>
                  <div className="text-sm text-muted-foreground">
                    {moment(component.createdAt).format("DD/MM/YYYY")}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 min-h-96 h-96 max-h-96">
              <CodeEditor codeValue={component.code} setCodeValue={() => {}} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
