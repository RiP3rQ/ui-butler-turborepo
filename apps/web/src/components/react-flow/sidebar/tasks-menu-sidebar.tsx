"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import type { TaskType } from "@repo/types";
import { CoinsIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { TaskRegistry } from "@/lib/workflow/task/registery";

function TasksMenuSidebar(): JSX.Element {
  return (
    <aside className="w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 px-4 overflow-auto">
      <Accordion
        className="w-full"
        defaultValue={["extract", "parse", "time-control", "results-delivery"]}
        type="multiple"
      >
        {/* EXTRACT */}
        <AccordionItem value="extract">
          <AccordionTrigger className="font-bold">
            Data extraction
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {/*<TaskMenuBtn taskType={TaskType.PAGE_TO_HTML} />*/}
            {/*<TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />*/}
            {/*<TaskMenuBtn taskType={TaskType.EXTRACT_DATA_WITH_AI} />*/}
          </AccordionContent>
        </AccordionItem>
        {/* PARSE DATA */}
        <AccordionItem value="parse">
          <AccordionTrigger className="font-bold">
            User interactions
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {/*<TaskMenuBtn taskType={TaskType.FILL_INPUT} />*/}
            {/*<TaskMenuBtn taskType={TaskType.CLICK_ELEMENT} />*/}
            {/*<TaskMenuBtn taskType={TaskType.NAVIGATE_TO_URL} />*/}
            {/*<TaskMenuBtn taskType={TaskType.SCROLL_TO_ELEMENT} />*/}
          </AccordionContent>
        </AccordionItem>
        {/* Time controlling */}
        <AccordionItem value="time-control">
          <AccordionTrigger className="font-bold">
            Timing controls
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {/*<TaskMenuBtn taskType={TaskType.WAIT_FOR_ELEMENT} />*/}
          </AccordionContent>
        </AccordionItem>
        {/* Data storage */}
        <AccordionItem value="time-control">
          <AccordionTrigger className="font-bold">
            Data storage
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {/*<TaskMenuBtn taskType={TaskType.READ_PROPERTY_FROM_JSON} />*/}
            {/*<TaskMenuBtn taskType={TaskType.ADD_PROPERTY_TO_JSON} />*/}
          </AccordionContent>
        </AccordionItem>
        {/* Deliver results */}
        <AccordionItem value="results-delivery">
          <AccordionTrigger className="font-bold">
            Results delivery
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {/*<TaskMenuBtn taskType={TaskType.DELIVER_VIA_WEBHOOK} />*/}
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
  const task = TaskRegistry[taskType];

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
