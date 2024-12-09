"use client";

import { type SingleComponentApiResponseType } from "@repo/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Badge } from "@repo/ui/components/ui/badge";
import { CodeEditorWithPreview } from "@/components/code-editor/code-editor-with-preview";

interface SingleComponentViewProps {
  componentsData: SingleComponentApiResponseType;
}

const ACCORDION_ITEMS = [
  {
    id: "code-preview",
    value: "item-1",
    title: "Code + Preview",
    content: (code: string) => <CodeEditorWithPreview codeValue={code} />,
    checkImplemented: () => true, // Always enabled
  },
  {
    id: "typescript-docs",
    value: "item-2",
    title: "Typescript Docs",
    content: () => null, // Placeholder for TypeScript docs viewer
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.hasTypescriptDocs,
  },
  {
    id: "unit-tests",
    value: "item-3",
    title: "Unit tests",
    content: () => null, // Placeholder for unit tests viewer
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.wasUnitTested,
  },
  {
    id: "e2e-tests",
    value: "item-4",
    title: "E2E tests",
    content: () => null, // Placeholder for E2E tests viewer
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.wasE2ETested,
  },
  {
    id: "storybook",
    value: "item-5",
    title: "Storybook",
    content: () => null, // Placeholder for Storybook viewer
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.hasStorybook,
  },
] as const;

export function SingleComponentView({
  componentsData,
}: Readonly<SingleComponentViewProps>): JSX.Element {
  return (
    <Accordion
      type="multiple"
      className="w-full space-y-2"
      defaultValue={["item-1"]}
    >
      {ACCORDION_ITEMS.map(
        ({ id, value, title, content, checkImplemented }) => {
          const isImplemented = checkImplemented(componentsData);

          return (
            <AccordionItem
              key={id}
              value={value}
              disabled={!isImplemented}
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-4">
                <div className="flex items-center justify-between w-full gap-4">
                  <span className="font-medium">{title}</span>
                  {!isImplemented && <NotImplementedBadge />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {content(componentsData.code)}
              </AccordionContent>
            </AccordionItem>
          );
        },
      )}
    </Accordion>
  );
}

function NotImplementedBadge(): JSX.Element {
  return (
    <Badge
      className="
        bg-amber-500 text-white
        hover:bg-amber-700
        cursor-not-allowed
        transition-colors
        px-3 py-1
        text-xs font-medium
        rounded-full
        mr-3
      "
    >
      Not implemented yet
    </Badge>
  );
}
