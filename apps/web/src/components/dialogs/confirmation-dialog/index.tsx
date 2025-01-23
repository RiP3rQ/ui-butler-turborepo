import { type JSX } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { useConfirmationModalStore } from "@/store/confirmation-modal-store";

export function ConfirmationModal(): JSX.Element {
  const {
    isModalOpen,
    isPending,
    modalTitle,
    modalSubtitle,
    dialogContent,
    saveButtonText,
    cancelButtonText,
    saveButtonFunction,
    cancelButtonFunction,
    saveButtonDisabled,
  } = useConfirmationModalStore();

  return (
    <Dialog open={isModalOpen} onOpenChange={cancelButtonFunction}>
      <DialogContent className="flex h-fit max-w-[60vw] flex-col md:max-w-[40vw]">
        <DialogHeader>
          <DialogTitle>{modalTitle ?? "Confirmation"}</DialogTitle>
          <DialogDescription>
            {modalSubtitle ?? "Are you sure you want to perform this action?"}
          </DialogDescription>
        </DialogHeader>
        {dialogContent}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelButtonFunction}
            >
              {cancelButtonText ?? "Cancel"}
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={saveButtonDisabled}
            onClick={saveButtonFunction}
            className="flex items-center justify-center gap-1"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {saveButtonText ?? "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmationModal;
