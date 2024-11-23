import { useContext } from "react";
import { FlowValidationContext } from "@/context/flow-validation-context";

const useFlowValidation = () => {
  const context = useContext(FlowValidationContext);

  if (!context) {
    throw new Error(
      "useFlowValidation must be used within a FlowValidationProvider",
    );
  }

  return context;
};
export default useFlowValidation;
