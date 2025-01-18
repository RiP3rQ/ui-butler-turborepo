"use client";

import type { ParamProps } from "@repo/types";
import { type JSX } from "react";

function CodeInstanceParamField({ param }: Readonly<ParamProps>): JSX.Element {
  return <p className="text-xs">{param.name}</p>;
}

export default CodeInstanceParamField;
