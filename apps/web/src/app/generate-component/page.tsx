"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shared/ui/components/ui/card";
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
import { Textarea } from "@shared/ui/components/ui/textarea";
import { useChat } from "ai/react";
import { toast } from "sonner";
import {
  Loader2Icon,
  PlayCircleIcon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react";
import { cn } from "@shared/ui/lib/utils";
import { type JSX, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TooltipWrapper } from "@shared/ui/components/tooltip-wrapper";
import { useShallow } from "zustand/react/shallow";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  generateComponentSchema,
  type GenerateComponentSchemaType,
} from "@/schemas/component";
import CodeEditor from "@/components/code-editor/editor";
import { useModalsStateStore } from "@/store/modals-store";
import { CopyButton } from "@/components/copy-code-button";
import { PageHeader } from "@/components/page-header";

export default function GenerateComponentPage(): JSX.Element {
  const { createNewComponentModal } = useModalsStateStore(
    useShallow((state) => state),
  );

  const form = useForm<GenerateComponentSchemaType>({
    resolver: zodResolver(generateComponentSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const { messages, isLoading, append, reload, stop } = useChat({
    api: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api"}/components/generate`,
    credentials: "include",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    onError: (error) => {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });

  const handleGenerateComponent = useCallback(
    async (values: GenerateComponentSchemaType) => {
      try {
        await append({
          content: values.prompt,
          role: "user",
        });
      } catch (error) {
        console.error("Error generating component:", error);
        toast.error("Failed to generate component");
      }
    },
    [append],
  );

  // Get the latest assistant message
  const latestAssistantMessage = useMemo(
    () =>
      messages
        .filter((m) => m.role === "assistant")
        .map((m) => ({
          ...m,
          content: m.content.replace(/^```tsx|```$/g, "").trim(),
        }))
        .map((m) => ({
          ...m,
          content: m.content.endsWith("```")
            ? m.content.slice(0, -3).trim()
            : m.content,
        }))
        .pop(),
    [messages],
  );

  const handleReset = useCallback(() => {
    stop();
    reload();
    toast.success("Form reset successfully");
  }, [stop, reload]);

  const handleOpenSaveComponentModal = useCallback(() => {
    if (!latestAssistantMessage?.content) {
      toast.error("No code to save");
      return;
    }
    createNewComponentModal.setCode(latestAssistantMessage.content);
    createNewComponentModal.setIsOpen(true);
  }, [createNewComponentModal, latestAssistantMessage]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        form.handleSubmit(handleGenerateComponent)();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [form, handleGenerateComponent]);

  return (
    <div className="flex flex-col space-y-6 container py-6">
      <PageHeader
        title="Generate Component"
        description="Use AI to generate a new component"
      />
      <Card className="w-full">
        <CardContent className={"pt-4"}>
          <Form {...form}>
            <form
              className="space-y-6 w-full relative"
              onSubmit={form.handleSubmit(handleGenerateComponent)}
            >
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Prompt
                      <span className="text-primary text-xs">(Required)</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          {...field}
                          className={cn(
                            "w-full h-[30vh] resize-none",
                            isLoading && "blur-sm",
                          )}
                          placeholder="Enter your component description..."
                          disabled={isLoading}
                        />
                      </FormControl>
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                          <Card className="w-[300px]">
                            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                              <p className="text-center font-medium">
                                Generating your component...
                                <br />
                                <span className="text-sm text-muted-foreground">
                                  This might take a few seconds
                                </span>
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      ) : null}
                    </div>
                    <FormDescription>
                      Enter a detailed description of the component you want to
                      generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="flex items-center justify-between p-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  className={cn(
                    "gap-2",
                    isLoading && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <RotateCcwIcon className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "gap-2",
                    isLoading && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <PlayCircleIcon className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      {latestAssistantMessage ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Component
              <div className="flex items-center justify-center space-x-2">
                <CopyButton value={latestAssistantMessage.content} />
                <TooltipWrapper content="Save the generated code to a project">
                  <Button
                    onClick={handleOpenSaveComponentModal}
                    variant="default"
                    size="sm"
                    className="gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!latestAssistantMessage.content || isLoading}
                  >
                    <SaveIcon className="h-4 w-4" />
                    Save component
                  </Button>
                </TooltipWrapper>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[80vh]">
              <CodeEditor
                codeValue={latestAssistantMessage.content}
                setCodeValue={() => {}}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
