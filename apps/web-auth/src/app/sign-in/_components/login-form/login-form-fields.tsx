import { type JSX } from "react";
import { type Control } from "react-hook-form";
import { type z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/ui/components/ui/form";
import { Input } from "@shared/ui/components/ui/input";
import { Separator } from "@shared/ui/components/ui/separator";
import { type loginFormSchema } from "@/schemas/login-schema";

interface LoginFormFieldsProps {
  control: Control<z.infer<typeof loginFormSchema>>;
  isDisabled: boolean;
}

export function LoginFormFields({
  control,
  isDisabled,
}: Readonly<LoginFormFieldsProps>): JSX.Element {
  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormControl>
              <Input
                id="email"
                data-testid="email"
                disabled={isDisabled}
                placeholder="ui-butler@gmail.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="password">Password</FormLabel>
            <FormControl>
              <Input
                id="password"
                data-testid="password"
                disabled={isDisabled}
                type="password"
                placeholder="Super safe password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
