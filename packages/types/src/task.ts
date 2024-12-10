export enum TaskType {
  SET_CODE_CONTEXT = "SET_CODE_CONTEXT",
  // GENERAL TASKS
  IMPROVE_STYLES = "IMPROVE_STYLES",
  OPTIMIZE_CODE = "OPTIMIZE_CODE",
  // TESTS
  CREATE_UNIT_TESTS = "CREATE_UNIT_TESTS",
  CREATE_E2E_TESTS = "CREATE_E2E_TESTS",
  // DOCS
  CREATE_TYPESCRIPT_DOCUMENTATION = "CREATE_TYPESCRIPT_DOCUMENTATION",
  CREATE_MDX_DOCUMENTATION = "CREATE_MDX_DOCUMENTATION",
}

export enum TaskParamType {
  STRING = "STRING",
  CODE_INSTANCE = "CODE_INSTANCE",
  SELECT = "SELECT",
  CREDENTIAL = "CREDENTIAL",
}

export interface TaskParam {
  name: string;
  type: TaskParamType;
  helperText?: string;
  required?: boolean;
  hideHandle?: boolean;
  variant?: string;
  [key: string]: any;
}
