import type { BaseWorkflowTask, TaskType } from "@repo/types";
import { ServerSetCodeContextTask } from "./set-code-context";

type ServerRegistry = {
  [Key in TaskType]: BaseWorkflowTask;
};

export const ServerTaskRegister: ServerRegistry = {
  SET_CODE_CONTEXT: ServerSetCodeContextTask,
};
