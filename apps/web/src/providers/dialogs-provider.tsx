"use client";

import { useEffect, useState } from "react";
import { ActionRunDialog } from "@/components/code-editor/action-run-dialog";
import { CreateNewComponentDialog } from "@/components/dialogs/new-component-dialog";
import ConfirmationDialog from "@/components/dialogs/confirmation-dialog";

export function DialogsComponentsProvider(): JSX.Element {
  // This is a workaround to prevent the component from rendering on the server
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);
  if (!isMounted) return <></>;

  return (
    <>
      <ActionRunDialog />
      <CreateNewComponentDialog />
      <ConfirmationDialog />
    </>
  );
}
