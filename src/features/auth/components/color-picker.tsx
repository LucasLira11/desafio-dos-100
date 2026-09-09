"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_COLOR_PALETTE } from "@/lib/user-color";

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Sua cor de identificação</span>
        <span className="text-xs text-muted-foreground">Opcional</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {USER_COLOR_PALETTE.map((color) => {
          const isSelected = value === color.value;
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(isSelected ? "" : color.value)}
              aria-label={color.name}
              aria-pressed={isSelected}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-transform duration-150",
                "ring-2 ring-offset-2 ring-offset-card",
                isSelected ? "ring-foreground scale-105" : "ring-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color.value }}
            >
              {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Usada para te identificar no histórico e no início. Se não escolher, usamos verde ou roxo automaticamente.
      </p>
    </div>
  );
}
