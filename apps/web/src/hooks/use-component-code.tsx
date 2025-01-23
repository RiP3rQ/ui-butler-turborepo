"use client";

import {
  generateCodeFunction,
  updateComponentCode,
} from "@/actions/components/server-actions";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  type CodeType,
  type Component,
  type ComponentsEndpoints,
} from "@shared/types";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function useComponentCode(
  projectId: string,
  componentId: string,
): {
  updating: CodeType | null;
  setUpdating: (codeType: CodeType | null) => void;
  generatingCodeType: CodeType | null;
  updateMutation: UseMutationResult<
    Component,
    Error,
    ComponentsEndpoints["updateComponentCode"]["params"] &
      ComponentsEndpoints["updateComponentCode"]["body"]
  >;
  generateMutation: UseMutationResult<
    Component,
    Error,
    {
      componentId: number;
      codeType: CodeType;
    }
  >;
} {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<CodeType | null>(null);
  const [generatingCodeType, setGeneratingCodeType] = useState<CodeType | null>(
    null,
  );
  const updateMutation = useMutation<
    Component,
    Error,
    Readonly<
      ComponentsEndpoints["updateComponentCode"]["params"] &
        ComponentsEndpoints["updateComponentCode"]["body"]
    >
  >({
    mutationFn: updateComponentCode,
    onSuccess: () => {
      toast.success("Component updated successfully");
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      setUpdating(null);
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateCodeFunction,
    onMutate: (variables) => {
      setGeneratingCodeType(variables.codeType);
    },
    onSuccess: () => {
      toast.success("Code generated successfully");
      invalidateQueries();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      setGeneratingCodeType(null);
    },
  });

  const invalidateQueries = (): void => {
    queryClient.invalidateQueries({
      queryKey: ["single-component", projectId, componentId],
    });
  };

  return {
    updating,
    setUpdating,
    generatingCodeType,
    updateMutation,
    generateMutation,
  };
}
