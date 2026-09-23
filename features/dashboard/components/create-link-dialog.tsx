"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface CreateLinkDialogProps {
  isOpen: boolean
  newUrl: string
  newCustomAlias: string
  newExpiry: string
  onOpenChange: (open: boolean) => void
  onUrlChange: (val: string) => void
  onCustomAliasChange: (val: string) => void
  onExpiryChange: (val: string) => void
  onCreateLink: (e: React.FormEvent) => void
}

export function CreateLinkDialog({
  isOpen,
  newUrl,
  newCustomAlias,
  newExpiry,
  onOpenChange,
  onUrlChange,
  onCustomAliasChange,
  onExpiryChange,
  onCreateLink,
}: CreateLinkDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Create New Short Link</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Shorten any URL with instant redirect and optional custom alias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onCreateLink} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label htmlFor="create-url" className="text-xs font-medium text-foreground block">
              Destination URL
            </label>
            <Input
              id="create-url"
              type="url"
              required
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
            <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:border-electric-blue focus-within:ring-2 focus-within:ring-electric-blue/20">
              <span className="bg-paper px-3 py-2 text-xs font-mono text-muted-foreground border-r border-border select-none">
                shortenTHATlink/
              </span>
              <Input
                id="create-alias"
                type="text"
                placeholder="custom-slug"
                value={newCustomAlias}
                onChange={(e) => onCustomAliasChange(e.target.value.toLowerCase())}
                className="border-0 shadow-none focus-visible:ring-0 h-9 text-xs font-mono px-2.5"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="create-expiry" className="text-xs font-medium text-foreground block">
              Expiration
            </label>
            <Select value={newExpiry} onValueChange={(val) => val && onExpiryChange(val)}>
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
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Shorten Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
