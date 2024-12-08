import {
  BookOpenIcon,
  FileCode2Icon,
  SaveIcon,
  TabletSmartphoneIcon,
  TestTubeDiagonalIcon,
} from "lucide-react";
import type { EditorActionsType } from "@repo/types";

async function testFunction() {
  await console.log("Test function");
}

// const { updateIsOpen, updateActionTitle, updateActionSubTitle } =
//   useExecuteRunActionDialogState();

export const CODE_ACTIONS = [
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
