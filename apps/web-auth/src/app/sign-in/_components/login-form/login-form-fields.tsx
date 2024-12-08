import { Control } from "react-hook-form";
import { z } from "zod";
import { loginFormSchema } from "@/schemas/login-schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";

interface LoginFormFieldsProps {
  control: Control<z.infer<typeof loginFormSchema>>;
  isDisabled: boolean;
}

export function LoginFormFields({
  control,
  isDisabled,
}: Readonly<LoginFormFieldsProps>) {
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
