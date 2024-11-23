"use client";

import type { ParamProps } from "@repo/types/src/appNode";

function BrowserInstanceParamField({ param }: Readonly<ParamProps>) {
  return <p className="text-xs">{param.name}</p>;
}
export default BrowserInstanceParamField;
