import { type Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/ui/components/ui/form";
import { Input } from "@shared/ui/components/ui/input";
import { Separator } from "@shared/ui/components/ui/separator";
import { Textarea } from "@shared/ui/components/ui/textarea";
import { ColorPicker } from "@shared/ui/components/color-picker";
import { type JSX } from "react";
import { type CreateNewProjectSchemaType } from "@/schemas/project";

interface ProjectFormFieldsProps {
  control: Control<CreateNewProjectSchemaType>;
  isDisabled: boolean;
}

export function ProjectFormFields({
  control,
  isDisabled,
}: Readonly<ProjectFormFieldsProps>): JSX.Element {
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <FormControl>
              <Input
                id="title"
                data-testid="title"
                disabled={isDisabled}
                placeholder="Forms"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <FormControl>
              <Textarea
                id="description"
                data-testid="description"
                disabled={isDisabled}
                placeholder="Forms is a project to organize all the forms components"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
      <FormField
        control={control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="description">Color</FormLabel>
            <FormControl>
              <ColorPicker
                selectedColor={field.value}
                setSelectedColor={(color) => {
                  field.onChange(color);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
