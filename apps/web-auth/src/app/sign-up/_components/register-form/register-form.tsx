"use client";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import React from "react";
import { Form } from "@/components/ui/form";
import { useRegisterForm } from "@/hooks/use-register-form";
import { RegisterFormFields } from "@/app/sign-up/_components/register-form/register-form-fields";
import { SocialLoginButtons } from "@/app/sign-in/_components/social-platform-buttons/social-buttons";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function RegisterForm({ className, ...props }: UserAuthFormProps) {
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
            className={"w-full"}
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
