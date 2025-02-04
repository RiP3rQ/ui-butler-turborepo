"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  createNewProjectSchema,
  type CreateNewProjectSchemaType,
} from "@/schemas/project";
import { getErrorMessage } from "@/lib/get-error-message";
import { useProjectModalStore } from "@/store/project-modal-store";
import {
  createNewProjectFunction,
  editProjectFunction,
} from "@/actions/projects/server-actions";
import { Project } from "@shared/types";

type ProjectMutationVariables = {
  form: Readonly<CreateNewProjectSchemaType>;
  projectId?: number;
};

export function useProjectForm(
  isInEditMode: boolean,
  data?: Project,
): {
  form: ReturnType<typeof useForm<CreateNewProjectSchemaType>>;
  isPending: boolean;
  handleSubmit: (values: CreateNewProjectSchemaType) => void;
  isSubmitDisabled: boolean;
} {
  const queryClient = useQueryClient();
  const projectModal = useProjectModalStore(useShallow((state) => state));
  const form = useForm<CreateNewProjectSchemaType>({
    resolver: zodResolver(createNewProjectSchema),
    defaultValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      color: data?.color ?? "#000000",
    },
  });

  const mutationFn = async ({ form, projectId }: ProjectMutationVariables) => {
    if (isInEditMode) {
      if (!projectId) {
        throw new Error("Project id is missing in edit mode");
      }
      return editProjectFunction(projectId, form);
    } else {
      return createNewProjectFunction(form);
    }
  };

  const { mutate, isPending } = useMutation<
    Project,
    unknown,
    ProjectMutationVariables
  >({
    mutationFn,
    onSuccess: () => {
      form.reset();
      projectModal.close();
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stat-cards"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-favorited-components"],
      });
      toast.success(
        isInEditMode
          ? "Updated project successfully!"
          : "Created new project successfully!",
        { id: "project-form" },
      );
    },
    onError: (error) => {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: "project-form" });
    },
  });

  const handleSubmit = (values: CreateNewProjectSchemaType): void => {
    try {
      toast.loading(
        isInEditMode ? "Updating project..." : "Creating new project...",
        { id: "project-form" },
      );

      // For editing, include the project id in the mutation variables.
      if (isInEditMode) {
        mutate({ form: values, projectId: data?.id });
      } else {
        mutate({ form: values });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = getErrorMessage(e);
      toast.error(errorMessage, { id: "project-form" });
    }
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.formState.isValid ||
      !form.getValues("title") ||
      !form.getValues("color")
    );
  }, [form]);

  return { form, isPending, handleSubmit, isSubmitDisabled };
}
