import { Loader2, LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import React from "react";

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
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Icon className="mr-2 size-4" />
      )}{" "}
      {title}
    </Button>
  );
};
export default SocialPlatformButton;
