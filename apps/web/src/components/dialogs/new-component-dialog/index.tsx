"use client";

import { useSaveComponentForm } from "@/hooks/use-save-component-form";
import { useModalsStateStore } from "@/store/component-modal-store";
import { Button } from "@shared/ui/components/ui/button";
import { CardContent, CardFooter } from "@shared/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { Form } from "@shared/ui/components/ui/form";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { type JSX } from "react";
import { useShallow } from "zustand/react/shallow";
import { SaveNewComponentFormFields } from "./save-new-component-form-fields";

/**
 * Dialog component for creating a new component
 * Handles form submission, validation and API integration
 */
export function CreateNewComponentDialog(): JSX.Element {
  const { createNewComponentModal } = useModalsStateStore(
    useShallow((state) => ({
      createNewComponentModal: state.createNewComponentModal,
    })),
  );

  const {
    form,
    handleSubmit,
    closeButtonOnClickHandler,
    projects,
    isLoadingProjects,
    isPending,
  } = useSaveComponentForm();

  return (
    <Dialog
      onOpenChange={closeButtonOnClickHandler}
      open={createNewComponentModal.isOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new component</DialogTitle>
          <DialogDescription>
            To save this component, assign proper name and appropriate project.
          </DialogDescription>
        </DialogHeader>
        <CardContent className="h-fit">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 w-full"
            >
              <SaveNewComponentFormFields
                control={form.control}
                isDisabled={isPending}
                projects={projects}
                isLoadingProjects={isLoadingProjects}
              />
              <CardFooter className="flex items-center justify-end gap-3 p-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeButtonOnClickHandler}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="inline-flex items-center gap-2"
                  type="submit"
                  variant="default"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <SaveIcon className="size-4" />
                  )}
                  Save component
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
