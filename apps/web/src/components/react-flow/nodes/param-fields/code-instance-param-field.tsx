"use client";

import type { ParamProps } from "@repo/types";

function CodeInstanceParamField({ param }: Readonly<ParamProps>): JSX.Element {
  return <p className="text-xs">{param.name}</p>;
}

export default CodeInstanceParamField;
