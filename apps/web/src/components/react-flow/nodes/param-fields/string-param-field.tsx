"use client";

import { Label } from "@repo/ui/components/ui/label";
import { type JSX, useEffect, useId, useState } from "react";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import type { ParamProps } from "@repo/types";

function StringParamField({
  param,
  value,
  updateNodeParamValue,
  disabled,
}: Readonly<ParamProps>): JSX.Element {
  const id = useId();
  const [internalValue, setInternalValue] = useState<string>(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  let Component: typeof Input | typeof Textarea = Input;
  if (param.variant === "textarea") {
    Component = Textarea;
  }

  return (
    <div className="space-y-1 p-1 w-full">
      <Label className="text-xs flex" htmlFor="string-param" id={id}>
        {param.name}
        {param.required ? <span className="text-red-500 px-1">*</span> : null}
      </Label>
      <Component
        className="w-full text-xs"
        disabled={disabled}
        id={id}
        onBlur={(e) => {
          updateNodeParamValue(e.target.value);
        }}
        onChange={(e) => {
          setInternalValue(e.target.value);
        }}
        placeholder="Enter value here"
        type="text"
        value={internalValue}
      />
      {param.helperText ? (
        <p className="text-xs text-muted-foreground">{param.helperText}</p>
      ) : null}
    </div>
  );
}
export default StringParamField;
