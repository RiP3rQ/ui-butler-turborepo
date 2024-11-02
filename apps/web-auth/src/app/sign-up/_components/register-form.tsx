"use client";

import { useFormState } from "react-dom";
import register from "@/app/sign-up/server-action.ts";
import { Button } from "@repo/ui/components/ui/button";
import { GoogleLoginButton } from "react-social-login-buttons";
import Link from "next/link";

export function RegisterForm() {
  const [state, formAction] = useFormState(register, { error: "" });

  return (
    <form action={formAction}>
      <div className="h-screen flex items-center justify-center flex-col gap-5">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={`input input-bordered w-full max-w-xs ${
            state?.error && "input-error"
          }`}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className={`input input-bordered w-full max-w-xs ${
            state?.error && "input-error"
          }`}
        />
        {state?.error}
        <Button type="submit" variant={"default"}>
          Register
        </Button>
        <div className="flex">
          <GoogleLoginButton
            onClick={() =>
              (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
            }
          />
        </div>
        <div className={"underline cursor-pointer"}>
          <Link href={"/sign-in"}>or Login instead</Link>
        </div>
      </div>
    </form>
  );
}
