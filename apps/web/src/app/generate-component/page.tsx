"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useChat } from "ai/react";
import { toast } from "sonner";
import {
  CopyIcon,
  Loader2Icon,
  PlayCircleIcon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TooltipWrapper from "@repo/ui/components/tooltip-wrapper";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  generateComponentSchema,
  type GenerateComponentSchemaType,
} from "@/schemas/component";
import CodeEditor from "@/components/code-editor/editor";

export default function GenerateComponentPage(): JSX.Element {
  const form = useForm<GenerateComponentSchemaType>({
    resolver: zodResolver(generateComponentSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const { messages, isLoading, append, reload, stop } = useChat({
    api: `${process.env.NEXT_PUBLIC_API_URL}/components/generate`,
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

  const handleCopy = useCallback(async () => {
    if (latestAssistantMessage) {
      try {
        await navigator.clipboard.writeText(latestAssistantMessage.content);
        toast.success("Code copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy code to clipboard");
      }
    }
  }, [latestAssistantMessage]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        form.handleSubmit(handleGenerateComponent)();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)] w-full max-w-full px-8 py-4 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Generate Component</CardTitle>
          <CardDescription>
            Using this textarea type your prompt to generate a component. If
            possible make the prompt as specific as possible for the best
            results. The generated code can be saved in the selected project.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <TooltipWrapper content="Copy the generated code to clipboard">
                  <Button
                    onClick={handleCopy}
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </TooltipWrapper>
                <TooltipWrapper content="Save the generated code to a project">
                  <Button
                    onClick={handleCopy}
                    variant="default"
                    size="sm"
                    className="gap-2"
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
