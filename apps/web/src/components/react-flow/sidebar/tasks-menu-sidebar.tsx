"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { TaskType } from "@repo/types";
import { CoinsIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { type JSX } from "react";
import { ClientTaskRegister } from "@repo/tasks-registry";

function TasksMenuSidebar(): JSX.Element {
  return (
    <aside className="w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 px-4 overflow-auto">
      <Accordion
        className="w-full"
        defaultValue={["extract", "parse", "time-control", "results-delivery"]}
        type="multiple"
      >
        <AccordionItem value="general">
          <AccordionTrigger className="font-bold">
            General tasks
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            <TaskMenuBtn taskType={TaskType.OPTIMIZE_CODE} />
            <TaskMenuBtn taskType={TaskType.IMPROVE_STYLES} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tests">
          <AccordionTrigger className="font-bold">Tests</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            <TaskMenuBtn taskType={TaskType.CREATE_UNIT_TESTS} />
            <TaskMenuBtn taskType={TaskType.CREATE_E2E_TESTS} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="docs">
          <AccordionTrigger className="font-bold">
            Documentation
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            <TaskMenuBtn taskType={TaskType.CREATE_TYPESCRIPT_DOCUMENTATION} />
            <TaskMenuBtn taskType={TaskType.CREATE_MDX_DOCUMENTATION} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="stoppers">
          <AccordionTrigger className="font-bold">Stoppers</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            <TaskMenuBtn taskType={TaskType.APPROVE_CHANGES} />
            <TaskMenuBtn taskType={TaskType.SAVE_GENERATED_CODES} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
export default TasksMenuSidebar;

function TaskMenuBtn({
  taskType,
}: Readonly<{ taskType: TaskType }>): JSX.Element {
  const task = ClientTaskRegister[taskType];

  function ondragstart(e: React.DragEvent, taskTypeOnDrag: TaskType): void {
    e.dataTransfer.setData("application/reactflow", taskTypeOnDrag);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <Button
      className="flex items-center justify-between gap-2 border w-full"
      draggable
      onDragStart={(e) => {
        ondragstart(e, taskType);
      }}
      variant="secondary"
    >
      <div className="flex gap-2 items-center justify-center">
        <task.icon size={20} />
        {task.label}
      </div>
      <Badge className="gap-2 flex items-center" variant="outline">
        <CoinsIcon size={16} />
        {task.credits}
      </Badge>
    </Button>
  );
}
