"use client";

import type { ParamProps } from "@shared/types";
import { type JSX, useId } from "react";
import { Label } from "@shared/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";

interface OptionType {
  label: string;
  value: string;
}

function SelectParamField({
  param,
  value,
  updateNodeParamValue,
}: Readonly<ParamProps>): JSX.Element {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="text-xs flex" htmlFor={id}>
        {param.name}
        {param.required ? <span className="text-red-500">{" *"}</span> : null}
      </Label>
      <Select
        onValueChange={(valueChange: string) => {
          updateNodeParamValue(valueChange);
        }}
        value={value}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Options</SelectLabel>
            {param.options && Array.isArray(param.options)
              ? param.options.map((option: OptionType) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              : null}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
export default SelectParamField;
