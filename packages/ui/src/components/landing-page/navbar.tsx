import Link from "next/link";
import { type JSX } from "react";
import { Container } from "@shared/ui/components/landing-page/container";
import { Icons } from "@shared/ui/components/landing-page/icons";
import { buttonVariants } from "@shared/ui/components/ui/button";

interface NavbarProps {
  isUserLoggedIn: boolean;
}

export function Navbar({ isUserLoggedIn }: Readonly<NavbarProps>): JSX.Element {
  return (
    <header className="px-4 h-14 sticky top-0 inset-x-0 w-full bg-background/40 backdrop-blur-lg border-b border-border z-50">
      <Container reverse>
        <div className="flex items-center justify-between h-full mx-auto md:max-w-screen-xl">
          <div className="flex items-start">
            <Link className="flex items-center gap-2" href="/">
              <Icons.Logo className="w-8 h-8" />
              <span className="text-lg font-medium">UI-Butler</span>
            </Link>
          </div>
          <nav className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center justify-center gap-8">
              <Link
                className="hover:text-foreground/80 text-sm"
                href="#how-it-works"
              >
                How it works
              </Link>
              <Link
                className="hover:text-foreground/80 text-sm"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="hover:text-foreground/80 text-sm"
                href="#pricing"
              >
                Pricing
              </Link>
              <Link
                className="hover:text-foreground/80 text-sm"
                href="#newsletter"
              >
                Newsletter
              </Link>
            </ul>
          </nav>
          <div className="flex items-end justify-center gap-4">
            {/* CREATE A PROPER USER ICON WITH COMBOBOX OPTIONS */}
            {isUserLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* <Icons.User className="w-6 h-6" /> */}
                <Link
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                  href="/analytics-dashboard"
                >
                  Dashboard
                </Link>
                <span className="text-sm font-medium">User</span>
              </div>
            ) : (
              <div>
                <Link
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                  href="/sign-in"
                >
                  Login
                </Link>
                <Link
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden md:flex",
                  })}
                  href="/sign-up"
                >
                  Start free trial
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
