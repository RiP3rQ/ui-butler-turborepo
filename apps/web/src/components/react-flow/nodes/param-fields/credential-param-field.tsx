"use client";

import type { ParamProps } from "@repo/types";
import { type JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { getUserCredentials } from "@/actions/credentials/server-actions";

const formSchema = z.object({
  credential: z.string({
    required_error: "Please select a credential",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function CredentialParamField({
  param,
  value,
  updateNodeParamValue,
}: Readonly<ParamProps>): JSX.Element {
  const query = useQuery({
    queryKey: ["credentials-for-user"],
    queryFn: getUserCredentials,
    refetchInterval: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credential: value || "UI-Butler's API key (will cost extra credits)",
    },
  });

  function onSubmit(data: FormValues): void {
    updateNodeParamValue(data.credential);
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="credential"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1 w-full">
              <FormLabel className="text-xs flex">
                {param.name}
                {param.required ? (
                  <span className="text-red-500">{" *"}</span>
                ) : null}
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Credentials</SelectLabel>
                      <SelectItem value="UI-Butler's API key (will cost extra credits)">
                        UI-Butler&apos;s API key (will cost extra credits)
                      </SelectItem>
                      {query.data?.map((credential) => (
                        <SelectItem
                          key={credential.id}
                          value={String(credential.id)}
                        >
                          {credential.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export default CredentialParamField;
