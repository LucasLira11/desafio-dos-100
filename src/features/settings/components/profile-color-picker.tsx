"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ColorPicker } from "@/features/auth/components/color-picker";
import { updateProfileColorAction } from "@/features/settings/actions";

export function ProfileColorPicker({ initialColor }: { initialColor: string }) {
  const [color, setColor] = useState(initialColor);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setColor(value);
    startTransition(async () => {
      const result = await updateProfileColorAction(value);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Cor de identificação atualizada!");
      }
    });
  };

  return (
    <div className="relative rounded-2xl border border-border bg-card p-5">
      <ColorPicker value={color} onChange={handleChange} />
      {isPending && (
        <div className="absolute right-5 top-5">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
