import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { type Color, SketchPicker } from "react-color";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

interface ColorPickerProps {
  selectedColor: Color | string | undefined;
  setSelectedColor?: (color: Color | string) => void;
}

export function ColorPicker({
  selectedColor,
  setSelectedColor,
}: Readonly<ColorPickerProps>): React.ReactNode {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState<Color | undefined>(
    selectedColor ?? undefined,
  );

  useEffect(() => {
    if (!color) return;
    setSelectedColor && setSelectedColor(color);
  }, [color]);

  const backgroundColor = useMemo(() => {
    if (!color) return resolvedTheme === "dark" ? "#1F2937" : "#F3F4F6";
    return String(color);
  }, [color, resolvedTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex w-fit items-center">
          {color ? String(color) : "Pick color"}
          <div
            className="ml-2 h-4 w-4 rounded-full"
            style={{
              backgroundColor,
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <SketchPicker
          styles={{
            default: {
              picker: {
                backgroundColor:
                  resolvedTheme === "dark" ? "#1F2937" : "#F3F4F6",
              },
            },
          }}
          disableAlpha
          color={color}
          onChange={(colorResult) => {
            setColor(colorResult.hex);
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
