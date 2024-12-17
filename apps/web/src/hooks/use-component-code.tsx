"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type CodeType, type ComponentType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  updateComponentCode,
  type UpdateComponentCodeProps,
} from "@/actions/components/update-components-code";
import { generateCodeFunction } from "@/actions/components/generate-code-function";

export function useComponentCode(projectId: string, componentId: string) {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<CodeType | null>(null);
  const [generatingCodeType, setGeneratingCodeType] = useState<CodeType | null>(
    null,
  );
  const updateMutation = useMutation<
    ComponentType,
    Error,
    Readonly<UpdateComponentCodeProps>
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

  const invalidateQueries = () => {
    // @ts-expect-error Reason: queryClient has no types
    queryClient.invalidateQueries(["single-component", projectId, componentId]);
  };

  return {
    updating,
    setUpdating,
    generatingCodeType,
    updateMutation,
    generateMutation,
  };
}
