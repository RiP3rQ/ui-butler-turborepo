"use client";

import CodeEditor from "@repo/ui/components/main-app/code-editor/editor";
import { Label } from "@repo/ui/components/ui/label";
import {
  BookOpenIcon,
  FileCode2Icon,
  SaveIcon,
  TabletSmartphoneIcon,
  TestTubeDiagonalIcon,
} from "lucide-react";
import type { EditorActionsType } from "@repo/types/code-editor-types";

export default function SaveNewComponentPage() {
  async function testFunction() {
    await console.log("Test function");
  }

  const ACTIONS = [
    {
      title: "Save component",
      icon: SaveIcon,
      function: testFunction,
    },
    {
      title: "Create unit tests for this component",
      icon: TestTubeDiagonalIcon,
      function: testFunction,
    },
    {
      title: "Create E2E tests for this component",
      icon: TabletSmartphoneIcon,
      function: testFunction,
    },
    {
      title: "Create storybook stories for this component",
      icon: BookOpenIcon,
      function: testFunction,
    },
    {
      title: "Create documentation for this component",
      icon: FileCode2Icon,
      function: testFunction,
    },
  ] satisfies EditorActionsType[];

  const handleSaveAction = async () => {
    // Do something with the code
    console.log("Code submitted");
  };

  return (
    <div className="flex items-center flex-col pt-10 h-screen">
      <div className="mb-6 flex items-center justify-center flex-col">
        <Label className="text-2xl font-semibold underline">
          Save new component
        </Label>
        <Label className="text-lg font-light">
          Using the code editor below, you can write your component code and
          then choose to save it or run an action.
        </Label>
      </div>
      <div className="w-full max-w-5xl h-[60vh]">
        <CodeEditor
          actions={ACTIONS}
          className="w-full"
          handleSaveAction={() => handleSaveAction()}
        />
      </div>
    </div>
  );
}
