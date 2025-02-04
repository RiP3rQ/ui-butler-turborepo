import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/components/ui/dialog";
import { Button } from "@shared/ui/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { Form } from "@shared/ui/components/ui/form";
import { Loader2Icon } from "lucide-react";
import { type JSX, useMemo } from "react";
import { useProjectModalStore } from "@/store/project-modal-store";
import { useProjectForm } from "@/hooks/use-project-form";
import { ProjectFormFields } from "@/components/dialogs/project-dialog/project-form-fields";

interface NewProjectDialogProps {
  dialogTrigger?: JSX.Element;
}

export function ProjectDialog({
  dialogTrigger,
}: Readonly<NewProjectDialogProps>): JSX.Element {
  const projectModal = useProjectModalStore(useShallow((state) => state));
  console.log(projectModal);
  const isInEditMode = useMemo(() => {
    return Boolean(projectModal.mode === "edit" && projectModal.data);
  }, [projectModal]);

  const { form, handleSubmit, isPending, isSubmitDisabled } =
    useProjectForm(isInEditMode);
  const isFormDisabled = isPending || form.formState.isSubmitting;

  const resetDialog = (open?: boolean) => {
    if (!open) {
      projectModal.reset();
      form.reset();
    }
  };

  return (
    <Dialog open={projectModal.isOpen} onOpenChange={resetDialog}>
      {dialogTrigger ? (
        <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isInEditMode ? "Edit project data" : "Create new project"}
          </DialogTitle>
          <DialogDescription>
            {isInEditMode
              ? `Fill in the form below to update the old project, so you can adjust it better for yourself`
              : `Fill in the form below to create a new project, so you can better organize your components.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2"
          >
            <ProjectFormFields
              control={form.control}
              isDisabled={isFormDisabled}
            />
            <DialogFooter>
              <Button
                type="button"
                onClick={() => resetDialog()}
                disabled={isFormDisabled}
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
                    {isInEditMode
                      ? "Editing the old project..."
                      : "Creating new project..."}
                  </div>
                ) : isInEditMode ? (
                  "Edit the old project"
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
