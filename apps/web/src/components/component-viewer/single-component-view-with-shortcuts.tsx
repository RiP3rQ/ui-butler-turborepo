"use client";

import { useQuery } from "@tanstack/react-query";
import { type SingleComponentViewProps } from "@repo/types";
import { CodeEditorKeyboardShortcuts } from "@/components/code-editor/code-editor-keyboard-shortcuts";
import { getSingleComponentsDataFunction } from "@/actions/components/get-single-components-data";
import { SingleComponentView } from "@/components/component-viewer/single-component-view";

export default function SingleComponentViewWithShortcuts(
  props: SingleComponentViewProps,
) {
  const { data: componentData } = useQuery({
    queryKey: ["single-component", props.projectId, props.componentId],
    queryFn: () =>
      getSingleComponentsDataFunction({
        projectId: props.projectId,
        componentId: props.componentId,
      }),
    initialData: props.componentsData,
  });

  return (
    <>
      <CodeEditorKeyboardShortcuts />
      <SingleComponentView
        componentsData={componentData}
        projectId={props.projectId}
        componentId={props.componentId}
      />
    </>
  );
}
