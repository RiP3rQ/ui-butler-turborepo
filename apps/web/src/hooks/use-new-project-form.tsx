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
import { useModalsStateStore } from "@/store/modals-store";
import { createNewProjectFunction } from "@/actions/projects/server-actions";

export function useNewProjectForm(): {
  form: ReturnType<typeof useForm<CreateNewProjectSchemaType>>;
  isPending: boolean;
  handleSubmit: (values: CreateNewProjectSchemaType) => void;
  isSubmitDisabled: boolean;
} {
  const queryClient = useQueryClient();
  const { createNewProjectModal } = useModalsStateStore(
    useShallow((state) => state),
  );
  const form = useForm<CreateNewProjectSchemaType>({
    resolver: zodResolver(createNewProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      color: "#000000",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createNewProjectFunction,
    onSuccess: () => {
      form.reset();
      createNewProjectModal.setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: "user-projects" });
      queryClient.invalidateQueries({ queryKey: "dashboard-stat-cards" });
      queryClient.invalidateQueries({
        queryKey: "dashboard-favorited-components",
      });
      toast.success("Created new project successfully!", { id: "new-project" });
    },
    onError: (error) => {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: "new-project" });
    },
  });

  const handleSubmit = (values: CreateNewProjectSchemaType): void => {
    try {
      toast.loading("Creating new project...", { id: "new-project" });
      mutate(values);
    } catch (e) {
      console.error(e);
      const errorMessage = getErrorMessage(e);
      toast.error(errorMessage, { id: "new-project" });
    }
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.formState.isValid ||
      !form.getValues("title") ||
      !form.getValues("color")
    );
  }, [form.formState.isValid, form.getValues]);

  return { form, isPending, handleSubmit, isSubmitDisabled };
}
