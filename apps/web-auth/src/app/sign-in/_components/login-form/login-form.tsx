"use client";

import { type JSX } from "react";
import { Form } from "@shared/ui/components/ui/form";
import { cn } from "@shared/ui/lib/utils";
import { Button } from "@shared/ui/components/ui/button";
import { LoginFormFields } from "@/app/sign-in/_components/login-form/login-form-fields";
import { SocialLoginButtons } from "@/app/sign-in/_components/social-platform-buttons/social-buttons";
import { useLoginForm } from "@/hooks/use-login-form";

export function LoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const { form, isPending, handleSubmit, isSubmitDisabled } = useLoginForm();
  const isFormDisabled = isPending || form.formState.isSubmitting;

  return (
    <div
      className={cn("grid gap-4", className)}
      {...props}
      data-testid="form-wrapper"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <LoginFormFields control={form.control} isDisabled={isFormDisabled} />
          <Button
            type="submit"
            className="w-full"
            disabled={isFormDisabled || isSubmitDisabled}
          >
            Sign in
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
