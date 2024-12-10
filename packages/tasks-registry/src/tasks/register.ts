import type { TaskType, WorkflowTask } from "@repo/types";
import { SetCodeContextTask } from "./set-code-context";

type ClientRegistry = {
  [Key in TaskType]: WorkflowTask & { type: Key };
};

export const ClientTaskRegister: ClientRegistry = {
  SET_CODE_CONTEXT: SetCodeContextTask,
};
