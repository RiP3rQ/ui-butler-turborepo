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

export function SingleComponentView({
  componentsData,
}: Readonly<SingleComponentViewProps>): JSX.Element {
  // check with options are implemented
  const implementedOptions = {
    hasTypescriptDocs: componentsData.hasTypescriptDocs,
    wasUnitTested: componentsData.wasUnitTested,
    wasE2ETested: componentsData.wasE2ETested,
    hasStorybook: componentsData.hasStorybook,
  };

  return (
    // set the default value based on implemented options
    <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Code + Preview</AccordionTrigger>
        <AccordionContent>
          <CodeEditorWithPreview codeValue={componentsData.code} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="item-2"
        disabled={!componentsData.hasTypescriptDocs}
      >
        <AccordionTrigger>
          <div className="flex items-center justify-between space-x-4 w-full mr-3">
            Typescript Docs
            <NotImplementedBadge
              booleanValue={!componentsData.hasTypescriptDocs}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/*<ComponentTypeScriptDescriptionViewer*/}
          {/*  hasTypescriptDocs={componentsData.hasTypescriptDocs}*/}
          {/*  typescriptDocsCode={componentsData.typescriptDocsCode}*/}
          {/*/>*/}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" disabled={!componentsData.wasUnitTested}>
        <AccordionTrigger>
          <div className="flex items-center justify-between space-x-4 w-full mr-3">
            Unit tests
            <NotImplementedBadge
              booleanValue={!componentsData.hasTypescriptDocs}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/*<ComponentUnitTestsViewer*/}
          {/*  wasUnitTested={componentsData.wasUnitTested}*/}
          {/*  unitTestCode={componentsData.unitTestsCode}*/}
          {/*/>*/}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4" disabled={!componentsData.wasE2ETested}>
        <AccordionTrigger>
          <div className="flex items-center justify-between space-x-4 w-full mr-3">
            E2E tests
            <NotImplementedBadge
              booleanValue={!componentsData.hasTypescriptDocs}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/*<ComponentE2ETestsViewer*/}
          {/*  wasE2ETested={componentsData.wasE2ETested}*/}
          {/*  e2eTestCode={componentsData.e2eTestsCode}*/}
          {/*/>*/}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5" disabled={!componentsData.hasStorybook}>
        <AccordionTrigger>
          <div className="flex items-center justify-between space-x-4 w-full mr-3">
            Storybook
            <NotImplementedBadge
              booleanValue={!componentsData.hasTypescriptDocs}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/*<ComponentStorybookViewer*/}
          {/*  hasStorybook={componentsData.hasStorybook}*/}
          {/*  storybookCode={componentsData.storybookCode}*/}
          {/*/>*/}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function NotImplementedBadge({
  booleanValue,
}: Readonly<{
  booleanValue: boolean;
}>): JSX.Element | null {
  if (!booleanValue) {
    return null;
  }
  return (
    <Badge className="bg-amber-500 text-white hover:bg-amber-700 cursor-not-allowed">
      Not implemented yet
    </Badge>
  );
}
