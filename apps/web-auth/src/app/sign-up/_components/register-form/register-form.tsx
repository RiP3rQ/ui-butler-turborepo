"use client";

import { SocialLoginButtons } from "@/app/sign-in/_components/social-platform-buttons/social-buttons";
import { RegisterFormFields } from "@/app/sign-up/_components/register-form/register-form-fields";
import { useRegisterForm } from "@/hooks/use-register-form";
import { Button } from "@shared/ui/components/ui/button";
import { Form } from "@shared/ui/components/ui/form";
import { cn } from "@shared/ui/lib/utils";
import { type JSX } from "react";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function RegisterForm({
  className,
  ...props
}: Readonly<UserAuthFormProps>): JSX.Element {
  const { form, isPending, onSubmit, isSubmitButtonBlocked } =
    useRegisterForm();
  const isFormDisabled = isPending || form.formState.isSubmitting;

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <RegisterFormFields
            control={form.control}
            isDisabled={isFormDisabled}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || isSubmitButtonBlocked}
          >
            Sign up
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <SocialLoginButtons isDisabled={isPending} />
    </div>
  );
}
