"use client";

import { saveComponentFunction } from "@/actions/components/server-actions";
import { getUserProjects } from "@/actions/projects/server-actions";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  saveComponentSchema,
  type SaveComponentSchemaType,
} from "@/schemas/component";
import { useModalsStateStore } from "@/store/component-modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Component, type Project } from "@shared/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

export function useSaveComponentForm(): {
  form: ReturnType<typeof useForm<SaveComponentSchemaType>>;
  handleSubmit: (values: SaveComponentSchemaType) => void;
  isPending: boolean;
  projects: Project[] | undefined;
  isLoadingProjects: boolean;
  closeButtonOnClickHandler: () => void;
} {
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const { createNewComponentModal } = useModalsStateStore(
    useShallow((state) => ({
      createNewComponentModal: state.createNewComponentModal,
    })),
  );

  const form = useForm<SaveComponentSchemaType>({
    resolver: zodResolver(saveComponentSchema),
    defaultValues: {
      title: "",
      projectId: "",
      code: "",
    },
  });

  const closeButtonOnClickHandler = useCallback(() => {
    form.reset();
    createNewComponentModal.setIsOpen(false);
  }, [createNewComponentModal, form]);

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: getUserProjects,
  });

  const { mutate: saveComponent, isPending } = useMutation<
    Component,
    Error,
    SaveComponentSchemaType
  >({
    mutationFn: saveComponentFunction,
    onSuccess: (response) => {
      startTransition(() => {
        form.reset();
        router.push(
          `/projects/${String(response.projectId)}/components/${String(
            response.id,
          )}`,
        );
        toast.success("Created new component successfully!", {
          id: "save-component",
        });
        closeButtonOnClickHandler();
      });
    },
    onError: (error: Error) => {
      console.error("Failed to save component:", error);
      toast.error(getErrorMessage(error), { id: "save-component" });
    },
  });

  const handleSubmit = useCallback(
    (values: SaveComponentSchemaType): void => {
      console.log(values);
      try {
        toast.loading("Saving component...", { id: "save-component" });
        saveComponent(values);
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage, { id: "save-component" });
      }
    },
    [saveComponent],
  );

  useEffect(() => {
    form.setValue("code", createNewComponentModal.code);
  }, [createNewComponentModal.code]);

  return {
    form,
    handleSubmit,
    isPending,
    projects,
    isLoadingProjects,
    closeButtonOnClickHandler,
  };
}
