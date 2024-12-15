import { TaskParamType } from "@repo/types";

export const ColorForHandle: Record<TaskParamType, string> = {
  [TaskParamType.CODE_INSTANCE]: "!bg-sky-400",
  [TaskParamType.STRING]: "!bg-amber-400",
  [TaskParamType.SELECT]: "!bg-rose-400",
  [TaskParamType.CREDENTIAL]: "!bg-purple-400",
  [TaskParamType.UNIT_TESTS]: "!bg-green-400",
  [TaskParamType.E2E_TESTS]: "!bg-blue-400",
  [TaskParamType.MDX]: "!bg-yellow-400",
  [TaskParamType.TS_DOCS]: "!bg-indigo-400",
};
