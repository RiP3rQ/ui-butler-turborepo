"use client";

import { useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import loginUser from "@/actions/login-user";
import { loginFormSchema } from "@/schemas/login-schema";

export function useLoginForm(): {
  form: ReturnType<typeof useForm<z.infer<typeof loginFormSchema>>>;
  isPending: boolean;
  handleSubmit: (values: z.infer<typeof loginFormSchema>) => void;
  isSubmitDisabled: boolean;
} {
  const [isPending, setIsPending] = useState<boolean>(false);
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (
    values: z.infer<typeof loginFormSchema>,
  ): Promise<void> => {
    setIsPending(true);
    await toast
      .promise(loginUser(values), {
        success: "Logged in successfully",
        loading: "Logging in...",
        error: "Failed to login!",
      })
      .unwrap()
      .then(() => {
        form.reset();
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.formState.isValid || !form.watch("email") || !form.watch("password")
    );
  }, [form, form.formState.isValid, form.watch]);

  return { form, isPending, handleSubmit, isSubmitDisabled };
}
