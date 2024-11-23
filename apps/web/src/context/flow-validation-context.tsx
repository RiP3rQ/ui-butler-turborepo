"use client";
import type { AppNodeMissingInputs } from "@repo/types/dist/appNode.ts";
import type { Dispatch, SetStateAction } from "react";
import { createContext, useState } from "react";

interface FlowValidationContextType {
  invalidInputs: AppNodeMissingInputs[];
  setInvalidInputs: Dispatch<SetStateAction<AppNodeMissingInputs[]>>;
  clearErrors: () => void;
}

export const FlowValidationContext =
  createContext<FlowValidationContextType | null>(null);

export function FlowValidationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [invalidInputs, setInvalidInputs] = useState<AppNodeMissingInputs[]>(
    [],
  );

  const clearErrors = () => {
    setInvalidInputs([]);
  };

  return (
    <FlowValidationContext.Provider
      value={{ invalidInputs, setInvalidInputs, clearErrors }}
    >
      {children}
    </FlowValidationContext.Provider>
  );
}
