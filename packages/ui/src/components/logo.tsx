import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";
import { SquareDashedMousePointerIcon } from "lucide-react";

type Props = {
  fontSize?: string;
  iconSize?: number;
};
const Logo = ({ fontSize = "2xl", iconSize = 20 }: Readonly<Props>) => {
  return (
    <Link
      href={"/"}
      className={cn(
        "text-2xl font-extrabold flex items-center gap-2",
        fontSize,
      )}
    >
      <div
        className={
          "rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-2"
        }
      >
        <SquareDashedMousePointerIcon
          size={iconSize}
          className={"stroke-white"}
        />
      </div>
      <div>
        <span
          className={
            "bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent"
          }
        >
          Scrappy
        </span>
        <span className={"text-stone-700 dark:text-stone-200"}>Buddy</span>
      </div>
    </Link>
  );
};
export default Logo;
