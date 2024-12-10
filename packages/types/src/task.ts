export enum TaskType {
  SET_CODE_CONTEXT = "SET_CODE_CONTEXT",
  // CREATE_TYPESCRIPT_DOCUMENTATION = "CREATE_TYPESCRIPT_DOCUMENTATION",
  // CREATE_UNIT_TESTS = "CREATE_UNIT_TESTS",
  // CREATE_E2E_TESTS = "CREATE_E2E_TESTS",
  // CREATE_STORYBOOK = "CREATE_STORYBOOK",
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
