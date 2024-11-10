import { Button } from "@repo/ui/components/ui/button";
import { Loader2, LucideIcon } from "lucide-react";

type SocialPlatformButtonProps = {
  title: string;
  icon: LucideIcon;
  isLoading: boolean;
  onClick: () => void;
};

const SocialPlatformButton = ({
  title,
  icon: Icon,
  isLoading,
  onClick,
}: Readonly<SocialPlatformButtonProps>) => {
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
};

export default SocialPlatformButton;
