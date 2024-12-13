import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";
import Icons from "@repo/ui/components/landing-page/icons";

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
      <div className={"p-2"}>
        <Icons.logo size={iconSize} />
      </div>
      <div>
        <span
          className={
            "bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent"
          }
        >
          UI
        </span>
        <span className={"text-stone-700 dark:text-stone-200"}>-Butler</span>
      </div>
    </Link>
  );
};
export default Logo;
