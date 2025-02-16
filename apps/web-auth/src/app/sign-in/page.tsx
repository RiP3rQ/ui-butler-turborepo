import { Icons } from "@shared/ui/components/landing-page/icons";
import { Separator } from "@shared/ui/components/ui/separator";
import { type Metadata } from "next";
import Link from "next/link";
import * as React from "react";
import { LoginForm } from "./_components/login-form/login-form";

export const metadata: Metadata = {
  title: "Login - UI-Butler",
  description: "Login to your UI-Butler account.",
};

export default function LoginPage(): React.ReactNode {
  return (
    <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden min-h-screen flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <a href={process.env.NEXT_PUBLIC_LANDING_PAGE_URL}>
          <div className="relative z-20 flex items-center gap-2 cursor-pointer">
            <Icons.Logo className="size-12" />
            <span className="text-4xl font-bold">UI-Butler</span>
          </div>
        </a>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-2xl">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className="text-sm">Jan Kowalski</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login to your account
            </h1>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <Separator />
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-muted-foreground">Don&#39;t have an account? </p>
            <Link href="/sign-up" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
