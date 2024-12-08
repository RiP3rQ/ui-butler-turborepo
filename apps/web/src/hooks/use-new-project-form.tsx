"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  createNewProjectSchema,
  type CreateNewProjectSchemaType,
} from "@/schemas/project";
import { getErrorMessage } from "@/lib/get-error-message";
import { createNewProjectFunction } from "@/actions/projects/create-new-project";
import { useModalsStateStore } from "@/store/modals-store";

export function useNewProjectForm(): {
  form: ReturnType<typeof useForm<CreateNewProjectSchemaType>>;
  isPending: boolean;
  handleSubmit: (values: CreateNewProjectSchemaType) => Promise<void>;
  isSubmitDisabled: boolean;
} {
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
      toast.success("Created new project successfully!", { id: "new-project" });
    },
    onError: (error) => {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: "new-project" });
    },
  });

  const handleSubmit = async (values: CreateNewProjectSchemaType) => {
    toast.loading("Creating new project...", { id: "new-project" });
    mutate(values);
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
