"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import React, { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@repo/ui/components/ui/separator";
import SocialPlatformButton from "@/app/sign-in/_components/social-platform-button.tsx";
import { GithubIcon, GlobeIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { registerFormSchema } from "@/schemas/register-schema.ts";
import registerUser from "@/actions/registerUser.ts";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function RegisterForm({ className, ...props }: UserAuthFormProps) {
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      form.reset();
      toast.success("Registration successful!", { id: "register" });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      toast.error(errorMessage, {
        id: "register",
        style: { background: "red" },
      });
    },
  });

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    toast.loading("Registering...", { id: "register" });
    mutate(values);
  }

  const isSubmitButtonBlocked = useMemo(() => {
    const values = form.watch();
    const errors = form.formState.errors;

    const hasValues = Boolean(
      values.username?.trim() &&
        values.email?.trim() &&
        values.password?.trim() &&
        values.confirmPassword?.trim(),
    );

    const hasNoErrors = Object.keys(errors).length === 0;
    const isPasswordMatch = values.password === values.confirmPassword;

    return !hasValues || !hasNoErrors || !isPasswordMatch;
  }, [form.watch(), form.formState.errors]);

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            disabled={isPending}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="SuperUser" {...field} />
                </FormControl>
                <FormDescription className={"text-xs"}>
                  Type your username that will be displayed to other users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            disabled={isPending}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type={"password"}
                    placeholder="Super safe password"
                    {...field}
                  />
                </FormControl>
                <FormDescription className={"text-xs"}>
                  Confirm your password by typing it again.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
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
