import { type JSX } from "react";
import { type Control } from "react-hook-form";
import { type z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";
import { FormDescription } from "@/components/ui/form";
import { type registerFormSchema } from "@/schemas/register-schema";

interface RegisterFormFieldsProps {
  control: Control<z.infer<typeof registerFormSchema>>;
  isDisabled: boolean;
}

export function RegisterFormFields({
  control,
  isDisabled,
}: Readonly<RegisterFormFieldsProps>): JSX.Element {
  return (
    <>
      <FormField
        control={control}
        disabled={isDisabled}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input placeholder="SuperUser" {...field} />
            </FormControl>
            <FormDescription className="text-xs">
              Type your username that will be displayed to other users.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        disabled={isDisabled}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="ui-butler@gmail.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
      <FormField
        control={control}
        disabled={isDisabled}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Super safe password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        disabled={isDisabled}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Super safe password"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Confirm your password by typing it again.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
