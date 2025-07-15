
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette } from "lucide-react";

export function AppearanceCard() {
  const [theme, setThemeState] = React.useState<"light" | "dark">("light");

  const setTheme = (theme: "light" | "dark") => {
    setThemeState(theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  };

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = storedTheme || systemTheme;
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/> Erscheinungsbild</CardTitle>
        <CardDescription>Passen Sie das Aussehen der Anwendung an.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
            <span>Dunkelmodus</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Wechseln Sie zwischen hellem und dunklem Design.
            </span>
          </Label>
          <Switch 
            id="dark-mode" 
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Dunkelmodus umschalten" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
