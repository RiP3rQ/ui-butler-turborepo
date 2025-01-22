import { type Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { type JSX } from "react";
import { type ProjectType } from "@repo/types";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from "@repo/ui/components/ui/select";
import { type SaveComponentSchemaType } from "@/schemas/component";

interface SaveNewComponentFormFieldsProps {
  control: Control<SaveComponentSchemaType>;
  isDisabled: boolean;
  projects: ProjectType[] | undefined;
  isLoadingProjects: boolean;
}

export function SaveNewComponentFormFields({
  control,
  isDisabled,
  projects,
  isLoadingProjects,
}: Readonly<SaveNewComponentFormFieldsProps>): JSX.Element {
  return (
    <div className="grid grid-cols-2 space-x-3">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1 items-center">
              Component&#39;s name
              <p className="text-primary text-xs">(Required)</p>
            </FormLabel>
            <FormControl>
              <Input {...field} className="h-9" disabled={isDisabled} />
            </FormControl>
            <FormDescription>
              Choose a descriptive name for your component
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="projectId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1 items-center">
              Project
              <p className="text-primary text-xs">(Required)</p>
            </FormLabel>
            <FormControl>
              {isLoadingProjects || !projects ? (
                <Skeleton className="w-full h-9" />
              ) : (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
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
  );
}
