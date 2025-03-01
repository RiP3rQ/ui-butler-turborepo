"use client";

import { SaveIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@shared/ui/components/ui/card";
import { Button } from "@shared/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/ui/components/ui/form";
import { Input } from "@shared/ui/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { Skeleton } from "@shared/ui/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { type JSX } from "react";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  saveComponentSchema,
  type SaveComponentSchemaType,
} from "@/schemas/component";
import CodeEditor from "@/components/code-editor/editor";
import { saveComponentFunction } from "@/actions/components/server-actions";
import { getUserProjects } from "@/actions/projects/server-actions";
import { PageHeader } from "@/components/page-header";

export default function SaveNewComponentPage(): JSX.Element {
  const router = useRouter();
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
      router.push(
        `/projects/${String(res.projectId)}/components/${String(res.id)}`,
      );
      toast.success("Created new component successfully!", {
        id: "new-component",
      });
    },
    onError: (error: unknown) => {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: "new-component" });
    },
  });

  const form = useForm<SaveComponentSchemaType>({
    resolver: zodResolver(saveComponentSchema),
    defaultValues: {
      title: "",
      projectId: "",
      code: "",
    },
  });

  const handleSaveAction = (values: SaveComponentSchemaType): void => {
    mutate(values);
  };

  return (
    <div className="flex flex-col space-y-6 container py-6">
      <PageHeader
        title="Save Component"
        description="Save a new component to your project"
      />
      <Card className="w-full h-full pt-5">
        <CardContent className="h-fit ">
          <Form {...form}>
            <form
              className="space-y-6 w-full"
              onSubmit={form.handleSubmit(handleSaveAction)}
            >
              <div className="grid grid-cols-2 space-x-4">
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
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Component&#39;s code
                      <p className="text-primary text-xs">(Required)</p>
                    </FormLabel>
                    <FormControl>
                      <CodeEditor
                        codeValue={field.value}
                        setCodeValue={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="flex items-center justify-end p-0">
                <Button
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  type="submit"
                  disabled={isPending} //TODO: Add proper validation
                >
                  Save
                  <SaveIcon className="size-4" />
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
