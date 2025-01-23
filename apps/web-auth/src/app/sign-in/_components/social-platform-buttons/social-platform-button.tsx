import { type JSX } from "react";
import { Button } from "@shared/ui/components/ui/button";
import { Loader2, type LucideIcon } from "lucide-react";

interface SocialPlatformButtonProps {
  title: string;
  icon: LucideIcon;
  isLoading: boolean;
  onClick: () => void;
}

function SocialPlatformButton({
  title,
  icon: Icon,
  isLoading,
  onClick,
}: SocialPlatformButtonProps): JSX.Element {
  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={onClick}
      className="variant-outline"
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-4 animate-spin" data-testid="loader" />
      ) : (
        <Icon className="mr-2 size-4" data-testid="icon" />
      )}{" "}
      {title}
    </Button>
  );
}

export default SocialPlatformButton;
