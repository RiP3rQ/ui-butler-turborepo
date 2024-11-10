"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { registerFormSchema } from "@/schemas/register-schema.ts";
import registerUser from "@/actions/registerUser.ts";

export function useRegisterForm() {
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

  return { form, isPending, onSubmit, isSubmitButtonBlocked };
}
