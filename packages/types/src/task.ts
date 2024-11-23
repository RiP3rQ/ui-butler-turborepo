export enum TaskType {
  LAUNCH_BROWSER = "LAUNCH_BROWSER",
}

export enum TaskParamType {
  STRING = "STRING",
  BROWSER_INSTANCE = "BROWSER_INSTANCE",
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
