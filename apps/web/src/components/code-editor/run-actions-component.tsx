import type { EditorActionsType } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

interface RunCodeEditorActionsProps {
  actions: EditorActionsType[];
}

export function RunCodeEditorActions({
  actions,
}: Readonly<RunCodeEditorActionsProps>): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex-shrink-0">
          <Button
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            type="button"
          >
            Run action
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={action.title + index}
              onClick={action.function}
            >
              {action.title}
              <DropdownMenuShortcut>
                <action.icon className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
