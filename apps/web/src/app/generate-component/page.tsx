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
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  generateComponentSchema,
  type GenerateComponentSchemaType,
} from "@/schemas/component";

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

  const handleGenerateComponent = async (
    values: GenerateComponentSchemaType,
  ) => {
    try {
      await append({
        content: values.prompt,
        role: "user",
      });
    } catch (error) {
      console.error("Error generating component:", error);
      toast.error("Failed to generate component");
    }
  };

  const handleReset = () => {
    form.reset();
    stop();
    reload();
    toast.success("Form reset successfully");
  };

  const handleCopy = async () => {
    if (latestAssistantMessage) {
      try {
        await navigator.clipboard.writeText(latestAssistantMessage.content);
        toast.success("Code copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy code to clipboard");
      }
    }
  };

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

  // Get the latest assistant message
  const latestAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .pop();

  console.log("messages", messages);
  console.log("isLoading", isLoading);

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
              className="space-y-6 w-full"
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
                    <FormControl>
                      <Textarea
                        {...field}
                        className="w-full h-[30vh] resize-none"
                        placeholder="Enter your component description..."
                        disabled={isLoading}
                      />
                    </FormControl>
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
                  className="gap-2"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "gap-2",
                    isLoading && "cursor-not-allowed opacity-60",
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
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <CopyIcon className="h-4 w-4" />
                Copy Code
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto max-h-[60vh] overflow-y-auto">
                <code className="text-sm">
                  {latestAssistantMessage.content}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Loading Overlay */}
      {isLoading ? (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
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
  );
}
