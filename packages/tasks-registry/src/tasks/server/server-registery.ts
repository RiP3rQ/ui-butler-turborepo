import { ServerSetCodeContextTask } from "./server-set-code-context";
import type { BaseWorkflowTask, TaskType } from "@repo/types";

type ServerRegistry = {
  [Key in TaskType]: BaseWorkflowTask;
};

export const ServerTaskRegister: ServerRegistry = {
  SET_CODE_CONTEXT: ServerSetCodeContextTask,
};
