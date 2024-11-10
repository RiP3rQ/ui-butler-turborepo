"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginFormSchema } from "@/schemas/login-schema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import loginUser from "@/actions/loginUser.ts";
import { toast } from "sonner";
import { useMemo } from "react";
import { getErrorMessage } from "@/lib/get-error-message.ts";

export function useLoginForm() {
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

  const handleSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    toast.loading("Logging in...", { id: "login" });
    mutate(values);
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.formState.isValid ||
      !form.getValues("email") ||
      !form.getValues("password")
    );
  }, [form.formState.isValid, form.getValues]);

  return { form, isPending, handleSubmit, isSubmitDisabled };
}
