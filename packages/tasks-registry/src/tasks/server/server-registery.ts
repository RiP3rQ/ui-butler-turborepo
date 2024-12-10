import { ServerSetCodeContextTask } from "./server-set-code-context";
import { BaseWorkflowTask, TaskType } from "@repo/types";
import { ServerOptimizeCodeTask } from "./server-optimize-code";
import { ServerImproveStylesTask } from "./server-improve-styles";
import { ServerCreateUnitTestsTask } from "./server-create-unit-tests";
import { ServerCreateE2ETestsTask } from "./server-create-e2e-tests";
import { ServerCreateMDXDocsTask } from "./server-create-mdx-docs";
import { ServerCreateTypeScriptDocsTask } from "./server-create-ts-docs";
import { ServerSaveGeneratedCodesTask } from "./server-save-generated-codes";
import { ServerApproveChangesTask } from "./server-approve-changes";

type ServerRegistry = {
  [Key in TaskType]: BaseWorkflowTask & { type: Key };
};

export const ServerTaskRegister: ServerRegistry = {
  [TaskType.SET_CODE_CONTEXT]: ServerSetCodeContextTask,
  // GENERAL TASKS
  [TaskType.OPTIMIZE_CODE]: ServerOptimizeCodeTask,
  [TaskType.IMPROVE_STYLES]: ServerImproveStylesTask,
  // TESTS
  [TaskType.CREATE_UNIT_TESTS]: ServerCreateUnitTestsTask,
  [TaskType.CREATE_E2E_TESTS]: ServerCreateE2ETestsTask,
  // DOCS
  [TaskType.CREATE_TYPESCRIPT_DOCUMENTATION]: ServerCreateTypeScriptDocsTask,
  [TaskType.CREATE_MDX_DOCUMENTATION]: ServerCreateMDXDocsTask,
  // STOPPERS
  [TaskType.SAVE_GENERATED_CODES]: ServerSaveGeneratedCodesTask,
  [TaskType.APPROVE_CHANGES]: ServerApproveChangesTask,
};
