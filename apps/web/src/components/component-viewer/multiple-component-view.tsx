"use client";
import { favoriteComponentFunction } from "@/actions/components/server-actions";
import CodeEditor from "@/components/code-editor/editor";
import { FavoriteButton } from "@/components/components/favorite-button";
import { protoTimestampToDate } from "@/lib/dates";
import { type Component, type ProjectDetails } from "@shared/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/ui/components/ui/accordion";
import { Button } from "@shared/ui/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, NavigationIcon } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { type JSX, useState } from "react";
import { toast } from "sonner";

interface MultipleComponentsViewProps {
  queryKey: string;
  components: Component[];
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
      queryClient.setQueryData([queryKey], (old: ProjectDetails) => ({
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
      toast.success("Successfully added to favorites");
      setMutatingComponentId(null);
    },
    onError: () => {
      toast.error("Failed to add to favorites");
      setMutatingComponentId(null);
    },
  });

  return (
    <Accordion type="multiple" className="space-y-4">
      {components.map((component) => (
        <AccordionItem
          key={component.id}
          value={`component-${String(component.id)}`}
          className="border rounded-lg bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <span className="font-semibold">{component.title}</span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {moment(protoTimestampToDate(component.createdAt)).format(
                    "DD/MM/YYYY",
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/projects/${String(component.projectId)}/components/${String(component.id)}`,
                    );
                  }}
                >
                  <NavigationIcon className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-muted/30">
              <CodeEditor codeValue={component.code} setCodeValue={() => {}} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
