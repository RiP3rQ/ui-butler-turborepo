"use client";

import type { LucideIcon } from "lucide-react";
import { DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Separator } from "@repo/ui/components/ui/separator";
import { JSX } from "react";

interface CustomDialogHeaderProps {
  icon?: LucideIcon;
  title?: string;
  subTitle?: string;

  iconClassName?: string;
  titleClassName?: string;
  subTitleClassName?: string;
}
function CustomDialogHeader({
  icon: Icon,
  title,
  subTitle,
  iconClassName,
  titleClassName,
  subTitleClassName,
}: Readonly<CustomDialogHeaderProps>): JSX.Element {
  return (
    <DialogHeader className="py-6">
      <DialogTitle asChild>
        <div className="flex flex-col items-center gap-2 mb-2">
          {Icon ? (
            <Icon className={`stroke-primary ${iconClassName}`} size={30} />
          ) : null}
          {title ? (
            <p className={`text-xl text-primary ${titleClassName}`}>{title}</p>
          ) : null}
          {subTitle ? (
            <p
              className={`text-muted-foreground text-sm text-center ${subTitleClassName}`}
            >
              {subTitle}
            </p>
          ) : null}
        </div>
      </DialogTitle>
      <Separator />
    </DialogHeader>
  );
}
export default CustomDialogHeader;
