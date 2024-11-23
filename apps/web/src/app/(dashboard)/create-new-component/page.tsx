"use client";

import { Label } from "@repo/ui/components/ui/label";
import {
  BookOpenIcon,
  FileCode2Icon,
  SaveIcon,
  TabletSmartphoneIcon,
  TestTubeDiagonalIcon,
} from "lucide-react";
import type { EditorActionsType } from "@repo/types";
import { useExecuteRunActionDialogState } from "@repo/ui/state/execute-run-action-state";
import { ActionRunDialog } from "@/components/code-editor/action-run-dialog";
import CodeEditor from "@/components/code-editor/editor";

export default function SaveNewComponentPage(): JSX.Element {
  const { updateIsOpen, updateActionTitle, updateActionSubTitle } =
    useExecuteRunActionDialogState();

  async function testFunction() {
    await console.log("Test function");
  }

  function testHandlerFunction() {
    updateIsOpen(true);
    updateActionTitle(
      "Create unit tests for this component - Run action execution",
    );
    updateActionSubTitle(
      "Here you can see execution of the creation of unit tests for this component in action. With execution information, logs and final output.",
    );
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
      function: testHandlerFunction,
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
    <>
      <ActionRunDialog />
      <div className="flex items-center flex-col pt-10 min-h-screen h-full w-full max-w-6xl mx-auto">
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
    </>
  );
}
