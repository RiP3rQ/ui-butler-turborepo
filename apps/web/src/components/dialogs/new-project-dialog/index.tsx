import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { Form } from "@repo/ui/components/ui/form";
import { Loader2Icon } from "lucide-react";
import { useModalsStateStore } from "@/store/modals-store";
import { useNewProjectForm } from "@/hooks/use-new-project-form";
import { CreateNewProjectFormFields } from "@/components/dialogs/new-project-dialog/create-new-project-form-fields";

interface NewProjectDialogProps {
  dialogTrigger?: JSX.Element;
}

export function NewProjectDialog({
  dialogTrigger,
}: Readonly<NewProjectDialogProps>): JSX.Element {
  const { createNewProjectModal } = useModalsStateStore(
    useShallow((state) => state),
  );
  const { form, handleSubmit, isPending, isSubmitDisabled } =
    useNewProjectForm();
  const isFormDisabled = isPending || form.formState.isSubmitting;

  return (
    <Dialog
      open={createNewProjectModal.isOpen}
      onOpenChange={createNewProjectModal.setIsOpen}
    >
      {dialogTrigger ? (
        <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Fill in the form below to create a new project, so you can better
            organize your components.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2"
          >
            <CreateNewProjectFormFields
              control={form.control}
              isDisabled={isFormDisabled}
            />
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  createNewProjectModal.setIsOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isFormDisabled || isSubmitDisabled}
              >
                {isPending ? (
                  <div className="flex items-center justify-center">
                    <Loader2Icon className="size-4 animate-spin mr-2" />
                    Creating new project...
                  </div>
                ) : (
                  "Create new project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
