import { Button } from "@repo/ui/components/ui/button";
import { HeartIcon, Loader2Icon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { type JSX } from "react";

interface FavoriteButtonProps {
  isPending: boolean;
  isFavorite: boolean;
  favoriteHandler: () => void;
}

export function FavoriteButton({
  isPending,
  isFavorite,
  favoriteHandler,
}: Readonly<FavoriteButtonProps>): JSX.Element {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="z-50"
      onClick={favoriteHandler}
    >
      {isPending ? (
        <Loader2Icon className="size-6 animate-spin" />
      ) : (
        <HeartIcon
          className={cn(
            "size-6",
            isFavorite ? "text-red-500" : "text-gray-500",
          )}
        />
      )}
    </Button>
  );
}
