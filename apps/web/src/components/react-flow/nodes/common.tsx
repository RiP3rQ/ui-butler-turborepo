import { TaskParamType } from "@repo/types";

export const ColorForHandle: Record<TaskParamType, string> = {
  [TaskParamType.CODE_INSTANCE]: "!bg-sky-400",
  [TaskParamType.STRING]: "!bg-amber-400",
  [TaskParamType.SELECT]: "!bg-rose-400",
  [TaskParamType.CREDENTIAL]: "!bg-purple-400",
};
