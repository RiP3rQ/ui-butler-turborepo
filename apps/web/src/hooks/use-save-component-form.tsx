"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback, useTransition } from "react";
import { useShallow } from "zustand/react/shallow";
import { type ComponentType, type ProjectType } from "@shared/types";
import { getErrorMessage } from "@/lib/get-error-message";
import { useModalsStateStore } from "@/store/modals-store";
import { getUserProjects } from "@/actions/projects/server-actions";
import {
  type SaveComponentSchemaType,
  saveComponentSchema,
} from "@/schemas/component";
import { saveComponentFunction } from "@/actions/components/server-actions";

export function useSaveComponentForm(): {
  form: ReturnType<typeof useForm<SaveComponentSchemaType>>;
  handleSubmit: (values: SaveComponentSchemaType) => void;
  isPending: boolean;
  projects: ProjectType[] | undefined;
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
      code: createNewComponentModal.code,
    },
  });

  const closeButtonOnClickHandler = useCallback(() => {
    form.reset();
    createNewComponentModal.setIsOpen(false);
  }, [createNewComponentModal, form]);

  const { data: projects, isLoading: isLoadingProjects } = useQuery<
    ProjectType[]
  >({
    queryKey: ["projects"],
    queryFn: getUserProjects,
  });

  const { mutate: saveComponent, isPending } = useMutation<
    ComponentType,
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

  return {
    form,
    handleSubmit,
    isPending,
    projects,
    isLoadingProjects,
    closeButtonOnClickHandler,
  };
}
