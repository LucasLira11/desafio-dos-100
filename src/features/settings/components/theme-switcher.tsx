"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita erro de hidratação no servidor garantindo que o tema só renderize no client
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex bg-muted/50 p-1 rounded-xl w-full">
      <Button 
        variant={theme === "light" ? "default" : "ghost"} 
        size="sm" 
        onClick={() => setTheme("light")} 
        className="flex-1 rounded-lg"
      >
        <Sun className="h-4 w-4 mr-2" /> Claro
      </Button>
      <Button 
        variant={theme === "dark" ? "default" : "ghost"} 
        size="sm" 
        onClick={() => setTheme("dark")} 
        className="flex-1 rounded-lg"
      >
        <Moon className="h-4 w-4 mr-2" /> Escuro
      </Button>
      <Button 
        variant={theme === "system" ? "default" : "ghost"} 
        size="sm" 
        onClick={() => setTheme("system")} 
        className="flex-1 rounded-lg"
      >
        <Monitor className="h-4 w-4 mr-2" /> Auto
      </Button>
    </div>
  );
}