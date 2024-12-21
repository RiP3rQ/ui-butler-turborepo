// constants/accordion-items.ts
import {
  BookOpenIcon,
  FileCode2Icon,
  TabletSmartphoneIcon,
  TestTubeDiagonalIcon,
} from "lucide-react";
import { type AccordionItemConfig } from "@repo/types";

export const ACCORDION_ITEMS: readonly AccordionItemConfig[] = [
  {
    id: "code-preview",
    value: "item-1",
    title: "Code",
    codeType: "code",
    getCode: (data) => data.code,
    checkImplemented: () => true,
  },
  {
    id: "typescript-docs",
    value: "item-2",
    title: "Typescript Docs",
    codeType: "typescriptDocs",
    getCode: (data) => data.tsDocs ?? "",
    checkImplemented: (data) => data.hasTypescriptDocs,
    action: {
      title: "Generate Typescript Docs",
      icon: FileCode2Icon,
    },
  },
  {
    id: "unit-tests",
    value: "item-3",
    title: "Unit tests",
    codeType: "unitTests",
    getCode: (data) => data.unitTests ?? "",
    checkImplemented: (data) => data.wasUnitTested,
    action: {
      title: "Generate Unit Tests",
      icon: TestTubeDiagonalIcon,
    },
  },
  {
    id: "e2e-tests",
    value: "item-4",
    title: "E2E tests",
    codeType: "e2eTests",
    getCode: (data) => data.e2eTests ?? "",
    checkImplemented: (data) => data.wasE2ETested,
    action: {
      title: "Generate E2E Tests",
      icon: TabletSmartphoneIcon,
    },
  },
  {
    id: "mdx-docs",
    value: "item-5",
    title: "MDX Docs",
    codeType: "mdxDocs",
    getCode: (data) => data.mdxDocs ?? "",
    checkImplemented: (data) => data.hasMdxDocs,
    action: {
      title: "Generate MDX Docs",
      icon: BookOpenIcon,
    },
  },
] as const;
