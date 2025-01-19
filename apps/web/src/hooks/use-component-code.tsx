"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type CodeType, type ComponentType } from "@repo/types";
import { type UseMutationResult } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  generateCodeFunction,
  updateComponentCode,
} from "@/actions/components/server-actions";
import { type UpdateComponentCodeRequest } from "@/actions/components/types";

export function useComponentCode(
  projectId: string,
  componentId: string,
): {
  updating: CodeType | null;
  setUpdating: (codeType: CodeType | null) => void;
  generatingCodeType: CodeType | null;
  updateMutation: UseMutationResult<
    ComponentType,
    Error,
    UpdateComponentCodeRequest
  >;
  generateMutation: UseMutationResult<
    ComponentType,
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
    ComponentType,
    Error,
    Readonly<UpdateComponentCodeRequest>
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
