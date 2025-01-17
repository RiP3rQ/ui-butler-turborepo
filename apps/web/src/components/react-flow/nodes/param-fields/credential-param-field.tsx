"use client";

import type { ParamProps } from "@repo/types";
import { type JSX, useId } from "react";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getUserCredentials } from "@/actions/credentials/server-actions";

function CredentialParamField({
  param,
  value,
  updateNodeParamValue,
}: Readonly<ParamProps>): JSX.Element {
  const id = useId();
  const query = useQuery({
    queryKey: ["credentials-for-user"],
    queryFn: getUserCredentials,
    refetchInterval: false,
  });

  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="text-xs flex" htmlFor={id}>
        {param.name}
        {param.required ? <span className="text-red-500">{" *"}</span> : null}
      </Label>
      <Select
        onValueChange={(selectedValue) => {
          console.log(selectedValue);
          updateNodeParamValue(selectedValue);
        }}
        value={value}
        defaultValue="DEFAULT_VALUE"
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Credentials</SelectLabel>
            {query.data?.map((credential) => (
              <SelectItem key={credential.id} value={String(credential.id)}>
                {credential.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
export default CredentialParamField;
