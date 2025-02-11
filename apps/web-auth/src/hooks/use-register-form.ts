"use client";

import { useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { registerFormSchema } from "@/schemas/register-schema";
import registerUser from "@/actions/register-user";

export function useRegisterForm(): {
  form: ReturnType<typeof useForm<z.infer<typeof registerFormSchema>>>;
  isPending: boolean;
  onSubmit: (values: z.infer<typeof registerFormSchema>) => void;
  isSubmitButtonBlocked: boolean;
} {
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      form.reset();
      toast.success("Registration successful!", { id: "register" });
    },
    onError: (error) => {
      toast.error(error.message, {
        id: "register",
      });
    },
  });

  const onSubmit = async (
    values: z.infer<typeof registerFormSchema>,
  ): Promise<void> => {
    toast.loading("Registering...", { id: "register" });
    await mutateAsync(values);
  };

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
    return !hasValues || !hasNoErrors;
  }, [form, form.formState]);

  return { form, isPending, onSubmit, isSubmitButtonBlocked };
}
