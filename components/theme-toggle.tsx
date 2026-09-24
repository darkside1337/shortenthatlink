"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "cn"

interface ThemeToggleProps {
  className?: string
}

const emptySubscribe = () => () => {}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "relative size-9 rounded-lg border border-border/80 bg-background text-foreground transition-all hover:border-border hover:bg-paper active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-electric-blue",
              className
            )}
            aria-label="Toggle theme"
          />
        }
      >
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 p-1">
        <DropdownMenuItem
          role="menuitemradio"
          aria-checked={mounted ? theme === "light" : undefined}
          onClick={() => setTheme("light")}
          className="flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded-md"
        >
          <span className="flex items-center gap-2">
            <Sun className="size-3.5 text-muted-foreground" />
            <span>Light</span>
          </span>
          {mounted && theme === "light" && (
            <Check className="size-3.5 text-electric-blue" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          role="menuitemradio"
          aria-checked={mounted ? theme === "dark" : undefined}
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded-md"
        >
          <span className="flex items-center gap-2">
            <Moon className="size-3.5 text-muted-foreground" />
            <span>Dark</span>
          </span>
          {mounted && theme === "dark" && (
            <Check className="size-3.5 text-electric-blue" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          role="menuitemradio"
          aria-checked={mounted ? theme === "system" : undefined}
          onClick={() => setTheme("system")}
          className="flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded-md"
        >
          <span className="flex items-center gap-2">
            <Monitor className="size-3.5 text-muted-foreground" />
            <span>System</span>
          </span>
          {mounted && theme === "system" && (
            <Check className="size-3.5 text-electric-blue" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
