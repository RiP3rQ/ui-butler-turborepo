"use client";

import { CopyIcon } from "@radix-ui/react-icons";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useExecuteRunActionDialogState } from "@repo/ui/state/execute-run-action-state.ts";

export function ActionRunDialog() {
  const {
    isOpen,
    actionTitle,
    actionSubTitle,
    actionButtonTitle,
    actionButtonOnClickHandler,
    closeButtonTitle,
    closeButtonOnClickHandler,
  } = useExecuteRunActionDialogState();

  return (
    <Dialog onOpenChange={closeButtonOnClickHandler} open={isOpen}>
      <DialogContent className="min-w-[90vw] xl:min-w-[60vw] h-[90vh]">
        <DialogHeader>
          <DialogTitle>{actionTitle}</DialogTitle>
          <DialogDescription>{actionSubTitle}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label className="sr-only" htmlFor="link">
              Link
            </Label>
            <Input
              defaultValue="https://ui.shadcn.com/docs/installation"
              id="link"
              readOnly
            />
          </div>
          <Button className="px-3" size="sm" type="submit">
            <span className="sr-only">Copy</span>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild onClick={closeButtonOnClickHandler}>
            <Button type="button" variant="secondary">
              {closeButtonTitle}
            </Button>
          </DialogClose>
          <Button
            onClick={actionButtonOnClickHandler}
            type="button"
            variant="secondary"
          >
            {actionButtonTitle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
