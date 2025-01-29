"use client";

import { useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import loginUser from "@/actions/login-user";
import { loginFormSchema } from "@/schemas/login-schema";
import { getErrorMessage } from "@/lib/get-error-message";

export function useLoginForm(): {
  form: ReturnType<typeof useForm<z.infer<typeof loginFormSchema>>>;
  isPending: boolean;
  handleSubmit: (values: z.infer<typeof loginFormSchema>) => void;
  isSubmitDisabled: boolean;
} {
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
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: "login" });
    },
  });

  const handleSubmit = async (
    values: z.infer<typeof loginFormSchema>,
  ): Promise<void> => {
    toast.loading("Logging in...", { id: "login" });
    mutate(values);
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.formState.isValid ||
      !form.getValues("email") ||
      !form.getValues("password")
    );
  }, [form]);

  return { form, isPending, handleSubmit, isSubmitDisabled };
}
