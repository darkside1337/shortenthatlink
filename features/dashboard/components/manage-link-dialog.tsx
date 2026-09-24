import { X, AlertCircle, AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AliasInput } from "@/components/ui/alias-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { LinkItem } from "../types"

interface ManageLinkDialogProps {
  managingLink: LinkItem | null
  manageAliasInput: string
  aliasError: string | null
  isDeleteConfirming: boolean
  isSubmitting?: boolean
  host?: string
  onClose: () => void
  onAliasInputChange: (val: string) => void
  onSaveManage: (e: React.FormEvent) => void
  onConfirmDelete: () => void
  onToggleDeleteConfirming: (val: boolean) => void
}

export function ManageLinkDialog({
  managingLink,
  manageAliasInput,
  aliasError,
  isDeleteConfirming,
  isSubmitting = false,
  host,
  onClose,
  onAliasInputChange,
  onSaveManage,
  onConfirmDelete,
  onToggleDeleteConfirming,
}: ManageLinkDialogProps) {
  return (
    <Dialog
      open={Boolean(managingLink)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md md:max-w-lg rounded-2xl border border-border bg-card p-0 shadow-2xl overflow-hidden"
      >
        {managingLink && (
          <div className="p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <DialogHeader className="gap-1.5 flex-1">
                <DialogTitle className="text-base font-medium tracking-tight text-foreground flex items-baseline gap-2 flex-wrap">
                  <span>Manage Link —</span>
                  <span className="font-mono text-sm font-normal px-2.5 py-0.5 rounded-md bg-paper border border-border text-foreground">
                    {managingLink.alias}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Rename this short link or permanently remove it.
                </DialogDescription>
              </DialogHeader>

              <DialogClose
                disabled={isSubmitting}
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isSubmitting}
                    onClick={onClose}
                    className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-paper shrink-0 -mt-1 -mr-1"
                  />
                }
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>

            {/* Rename Section */}
            <form onSubmit={onSaveManage} className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="manage-alias"
                  className="text-xs font-medium text-foreground block"
                >
                  Custom alias
                </label>

                {/* Alias Input Row */}
                <AliasInput
                  id="manage-alias"
                  disabled={isSubmitting}
                  value={manageAliasInput}
                  onChange={onAliasInputChange}
                  placeholder="custom-alias"
                  host={host}
                  aria-invalid={Boolean(aliasError)}
                  autoFocus
                />

                {/* Error State Display */}
                {aliasError && (
                  <p
                    className="text-[11px] font-medium text-rose-badge-text flex items-center gap-1.5 animate-in fade-in-50 duration-150"
                    role="alert"
                  >
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{aliasError}</span>
                  </p>
                )}

                {/* Inline helper text */}
                <div className="space-y-0.5 text-[11px] text-muted-foreground">
                  <p className="leading-relaxed">
                    Renaming is destructive — the previous short link will stop resolving immediately.
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/80">
                    4–52 characters, a-z 0-9 -
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isSubmitting ||
                    Boolean(aliasError) ||
                    !manageAliasInput.trim() ||
                    manageAliasInput.trim() === managingLink.alias
                  }
                  className="h-9 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98] transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>

            <hr className="border-t border-border/80" />

            {/* Danger Section */}
            <div className="rounded-xl border border-rose-badge-bg/60 bg-rose-badge-bg/25 p-4 transition-all">
              {isDeleteConfirming ? (
                <div className="space-y-3 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-medium text-rose-badge-text flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Are you sure?</span>
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This action cannot be undone. Link{" "}
                      <span className="font-mono text-foreground font-medium">
                        {host ? `${host}/${managingLink.alias}` : managingLink.alias}
                      </span>{" "}
                      will be permanently deleted and will stop redirecting immediately.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => onToggleDeleteConfirming(false)}
                      className="h-8 px-3 text-xs rounded-lg border-border hover:bg-paper"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={onConfirmDelete}
                      className="h-8 px-3.5 text-xs font-medium rounded-lg bg-rose-badge-text text-white hover:bg-rose-badge-text/90 active:scale-[0.98] shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        "Confirm Delete"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-medium text-rose-badge-text">
                      Delete this link
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      This action cannot be undone.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => onToggleDeleteConfirming(true)}
                    className="h-8 px-3.5 text-xs font-medium text-rose-badge-text border-rose-badge-text/30 bg-rose-badge-bg/50 hover:bg-rose-badge-bg hover:text-rose-badge-text rounded-lg transition-colors active:scale-[0.98] shrink-0 self-start sm:self-auto"
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                    <span>Delete Link</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
