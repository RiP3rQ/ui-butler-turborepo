import { TaskType, WorkflowTask } from "@repo/types";
import { SetCodeContextTask } from "./set-code-context";
import { OptimizeCodeTask } from "./optimize-code";
import { ImproveStylesTask } from "./improve-styles";
import { CreateUnitTestsTask } from "./create-unit-tests";
import { CreateE2ETestsTask } from "./create-e2e-tests";
import { CreateMDXDocsTask } from "./create-mdx-docs";
import { CreateTypeScriptDocsTask } from "./create-ts-docs";

type ClientRegistry = {
  [Key in TaskType]: WorkflowTask & { type: Key };
};

export const ClientTaskRegister: ClientRegistry = {
  [TaskType.SET_CODE_CONTEXT]: SetCodeContextTask,
  // GENERAL TASKS
  [TaskType.OPTIMIZE_CODE]: OptimizeCodeTask,
  [TaskType.IMPROVE_STYLES]: ImproveStylesTask,
  // TESTS
  [TaskType.CREATE_UNIT_TESTS]: CreateUnitTestsTask,
  [TaskType.CREATE_E2E_TESTS]: CreateE2ETestsTask,
  // DOCS
  [TaskType.CREATE_TYPESCRIPT_DOCUMENTATION]: CreateTypeScriptDocsTask,
  [TaskType.CREATE_MDX_DOCUMENTATION]: CreateMDXDocsTask,
};
