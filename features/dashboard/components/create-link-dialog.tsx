"use client"

import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AliasInput } from "@/components/ui/alias-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExpirationOption } from "@/features/shortener/types"

interface CreateLinkDialogProps {
  isOpen: boolean
  newUrl: string
  newCustomAlias: string
  newExpiry: ExpirationOption
  isSubmitting?: boolean
  createError?: string | null
  onOpenChange: (open: boolean) => void
  onUrlChange: (val: string) => void
  onCustomAliasChange: (val: string) => void
  onExpiryChange: (val: ExpirationOption) => void
  onCreateLink: (e: React.FormEvent) => void
}

export function CreateLinkDialog({
  isOpen,
  newUrl,
  newCustomAlias,
  newExpiry,
  isSubmitting = false,
  createError = null,
  onOpenChange,
  onUrlChange,
  onCustomAliasChange,
  onExpiryChange,
  onCreateLink,
}: CreateLinkDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onOpenChange(false)
      }}
    >
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Create New Short Link</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Shorten any URL with instant redirect and optional custom alias.
          </DialogDescription>
        </DialogHeader>

        {createError && (
          <div
            className="rounded-lg border border-rose-badge-text/30 bg-rose-badge-bg/40 p-3 text-xs text-rose-badge-text flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={onCreateLink} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label htmlFor="create-url" className="text-xs font-medium text-foreground block">
              Destination URL
            </label>
            <Input
              id="create-url"
              type="url"
              required
              disabled={isSubmitting}
              placeholder="https://example.com/long-page-url"
              value={newUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              className="h-10 text-xs px-3 bg-background border-border"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="create-alias" className="text-xs font-medium text-foreground block">
              Custom alias (optional)
            </label>
            <AliasInput
              id="create-alias"
              disabled={isSubmitting}
              placeholder="custom-slug"
              value={newCustomAlias}
              onChange={onCustomAliasChange}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="create-expiry" className="text-xs font-medium text-foreground block">
              Expiration
            </label>
            <Select
              disabled={isSubmitting}
              value={newExpiry}
              onValueChange={(val) => val && onExpiryChange(val as ExpirationOption)}
            >
              <SelectTrigger id="create-expiry" className="w-full h-9 text-xs bg-background border-border">
                <SelectValue placeholder="Select expiry" />
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

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                "Shorten Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
