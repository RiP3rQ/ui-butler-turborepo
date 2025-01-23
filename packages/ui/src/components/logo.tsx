import Link from "next/link";
import { Icons } from "@shared/ui/components/landing-page/icons";
import { cn } from "@shared/ui/lib/utils";

interface LogoProps {
  fontSize?: string;
  iconSize?: number;
}
export function Logo({
  fontSize = "2xl",
  iconSize = 20,
}: Readonly<LogoProps>): React.ReactNode {
  return (
    <Link
      href="/"
      className={cn(
        "text-2xl font-extrabold flex items-center gap-2",
        fontSize,
      )}
    >
      <div className="p-2">
        <Icons.Logo size={iconSize} />
      </div>
      <div>
        <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          UI
        </span>
        <span className="text-stone-700 dark:text-stone-200">-Butler</span>
      </div>
    </Link>
  );
}
