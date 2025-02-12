"use client";

import { useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { registerFormSchema } from "@/schemas/register-schema";
import registerUser from "@/actions/register-user";

export function useRegisterForm(): {
  form: ReturnType<typeof useForm<z.infer<typeof registerFormSchema>>>;
  isPending: boolean;
  onSubmit: (values: z.infer<typeof registerFormSchema>) => void;
  isSubmitButtonBlocked: boolean;
} {
  const [isPending, setIsPending] = useState<boolean>(false);
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof registerFormSchema>,
  ): Promise<void> => {
    setIsPending(true);
    await toast
      .promise(registerUser(values), {
        success: "Registration successful!",
        loading: "Registering...",
        error: "Failed to register!",
      })
      .unwrap()
      .then(() => {
        form.reset();
      })
      .finally(() => {
        setIsPending(false);
      });
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
