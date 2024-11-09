"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import React, { useMemo } from "react";
import { z } from "zod";
import { loginFormSchema } from "@/schemas/login-schema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@repo/ui/components/ui/separator";
import SocialPlatformButton from "@/app/sign-in/_components/social-platform-button.tsx";
import { GithubIcon, GlobeIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import loginUser from "@/actions/loginUser";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      form.reset();
      toast.success("Logged in successfully", { id: "login" });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      toast.error(errorMessage, {
        id: "login",
        style: { background: "red" },
      });
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    toast.loading("Logging in...", { id: "login" });
    mutate(values);
  }

  const isSubmitButtonBlocked = useMemo(() => {
    return (
      !form.formState.isValid &&
      !!form.getValues("email") &&
      !!form.getValues("password")
    );
  }, [form.formState.isValid, form.getValues]);

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            disabled={isPending}
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
            control={form.control}
            disabled={isPending}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type={"password"}
                    placeholder="Super safe password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={"w-full"}
            disabled={isPending || isSubmitButtonBlocked}
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
      <SocialPlatformButton
        title={"Google"}
        icon={GlobeIcon}
        isLoading={isPending}
        onClick={() =>
          (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
        }
      />
      <SocialPlatformButton
        title={"Github"}
        icon={GithubIcon}
        isLoading={isPending}
        onClick={() =>
          (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`)
        }
      />
    </div>
  );
}
