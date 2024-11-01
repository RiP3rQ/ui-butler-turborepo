import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/ui/button";
import Container from "@repo/ui/components/landing-page/container.tsx";
import Icons from "@repo/ui/components/landing-page/icons.tsx";

function Navbar() {
  // const user = await currentUser(); TODO: REFACTOR THIS INTO PROPER CUSTOM HOOK

  return (
    <header className="px-4 h-14 sticky top-0 inset-x-0 w-full bg-background/40 backdrop-blur-lg border-b border-border z-50">
      <Container reverse>
        <div className="flex items-center justify-between h-full mx-auto md:max-w-screen-xl">
          <div className="flex items-start">
            <Link className="flex items-center gap-2" href="/">
              <Icons.logo className="w-8 h-8" />
              <span className="text-lg font-medium">UI-Butler</span>
            </Link>
          </div>
          <nav className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center justify-center gap-8">
              <Link className="hover:text-foreground/80 text-sm" href="#">
                Pricing
              </Link>
              <Link className="hover:text-foreground/80 text-sm" href="#">
                About
              </Link>
              <Link className="hover:text-foreground/80 text-sm" href="#">
                Features
              </Link>
              <Link className="hover:text-foreground/80 text-sm" href="#">
                Blog
              </Link>
            </ul>
          </nav>
          <div className="flex items-end justify-center gap-4">
            {/*{user ? (*/}
            {/*    <UserButton/>*/}
            {/*) : (*/}
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
            {/*)}*/}
          </div>
        </div>
      </Container>
    </header>
  );
}

export default Navbar;
