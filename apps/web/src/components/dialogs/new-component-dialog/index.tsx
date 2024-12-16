"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import { useCallback } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useModalsStateStore } from "@/store/modals-store";
import { saveComponentFunction } from "@/actions/components/save-component";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  saveComponentSchema,
  type SaveComponentSchemaType,
} from "@/schemas/component";
import { getUserProjects } from "@/actions/projects/get-user-projects";

export function CreateNewComponentDialog(): JSX.Element {
  const router = useRouter();
  const { createNewComponentModal } = useModalsStateStore(
    useShallow((state) => state),
  );

  const form = useForm<SaveComponentSchemaType>({
    resolver: zodResolver(saveComponentSchema),
    defaultValues: {
      title: "",
      projectId: "",
      code: createNewComponentModal.code,
    },
  });

  const closeButtonOnClickHandler = useCallback(() => {
    form.reset();
    createNewComponentModal.setIsOpen(false);
  }, [createNewComponentModal]);

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return await getUserProjects();
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: saveComponentFunction,
    onSuccess: (res) => {
      form.reset();
      router.push(`/projects/${res.projectId}/components/${res.id}`);
      toast.success("Created new component successfully!", {
        id: "new-component",
      });
      closeButtonOnClickHandler();
    },
    onError: (error: unknown) => {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: "new-component" });
    },
  });

  const handleSaveAction = (values: SaveComponentSchemaType) => {
    mutate(values);
  };

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
        <CardContent className="h-fit ">
          <Form {...form}>
            <form
              className="space-y-6 w-full"
              onSubmit={form.handleSubmit(handleSaveAction)}
            >
              <div className="grid grid-cols-2 space-x-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1 items-center">
                        Component&#39;s name
                        <p className="text-primary text-xs">(Required)</p>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-9" />
                      </FormControl>
                      <FormDescription>
                        Choose a descriptive name for your component
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1 items-center">
                        Project
                        <p className="text-primary text-xs">(Required)</p>
                      </FormLabel>
                      <FormControl>
                        {isLoading || !data ? (
                          <Skeleton className="w-full h-9" />
                        ) : (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full h-9">
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.map((project) => (
                                <SelectItem
                                  key={project.id}
                                  value={String(project.id)}
                                >
                                  {project.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormDescription>
                        Choose the project where this component will be saved
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <CardFooter className="flex items-center justify-end gap-3 p-0">
                <DialogClose asChild onClick={closeButtonOnClickHandler}>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  type="submit"
                  variant="default"
                  disabled={isPending} // TODO: Add loading state
                >
                  {isPending ? (
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                  ) : (
                    <SaveIcon className="h-5 w-5" />
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
