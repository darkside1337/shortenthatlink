"use client"

import { Clock, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExpirationOption } from "../types"

interface AdvancedOptionsProps {
  isOpen: boolean
  onToggle: () => void
  customAlias: string
  onCustomAliasChange: (val: string) => void
  expiration: ExpirationOption
  onExpirationChange: (val: ExpirationOption) => void
}

export function AdvancedOptions({
  isOpen,
  onToggle,
  customAlias,
  onCustomAliasChange,
  expiration,
  onExpirationChange,
}: AdvancedOptionsProps) {
  return (
    <div className="pt-1">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors px-1 py-0.5 h-auto"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal className="size-3 text-muted-foreground" />
        <span>Advanced options</span>
        {isOpen ? (
          <ChevronUp className="size-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3 text-muted-foreground" />
        )}
      </Button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-border/60 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {/* Custom Alias Input */}
          <div className="space-y-1">
            <label
              htmlFor="custom-alias"
              className="block text-xs font-medium text-foreground"
            >
              Custom alias (optional)
            </label>
            <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:border-electric-blue focus-within:ring-2 focus-within:ring-electric-blue/20">
              <span className="bg-paper px-3 py-2 text-xs font-mono text-muted-foreground border-r border-border select-none">
                shortenTHATlink/
              </span>
              <Input
                id="custom-alias"
                type="text"
                value={customAlias}
                onChange={(e) => onCustomAliasChange(e.target.value)}
                placeholder="my-link"
                className="border-0 shadow-none focus-visible:ring-0 h-9 text-xs font-mono px-2.5"
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              4–52 characters, a-z 0-9 -
            </p>
          </div>

          {/* Expiration Dropdown */}
          <div className="space-y-1">
            <label
              htmlFor="link-expiration"
              className="block text-xs font-medium text-foreground"
            >
              Link expiration
            </label>
            <Select
              value={expiration}
              onValueChange={(val) => val && onExpirationChange(val as ExpirationOption)}
            >
              <SelectTrigger
                id="link-expiration"
                className="w-full h-9 text-xs bg-background border-border"
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Select expiry" />
                </div>
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="never">Never (Default)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
