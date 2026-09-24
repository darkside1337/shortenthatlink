"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { useOrigin } from "@/hooks/use-origin";

interface AliasInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  host?: string;
}

export function AliasInput({
  id = "alias-input",
  value,
  onChange,
  placeholder = "custom-slug",
  host: initialHost,
  className,
  ...props
}: AliasInputProps) {
  const { host: clientHost } = useOrigin();
  const host = initialHost || clientHost;
  const prefix = host ? `${host}/` : "shortenTHATlink/";

  return (
    <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:border-electric-blue focus-within:ring-2 focus-within:ring-electric-blue/20">
      <span className="bg-paper px-3 py-2 text-xs font-mono text-muted-foreground border-r border-border select-none shrink-0 truncate max-w-[140px] sm:max-w-[200px]">
        {prefix}
      </span>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
        placeholder={placeholder}
        className="border-0 shadow-none focus-visible:ring-0 h-9 text-xs font-mono px-2.5 rounded-none"
        {...props}
      />
    </div>
  );
}
