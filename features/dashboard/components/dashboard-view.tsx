"use client"

import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "../hooks/use-dashboard"
import { DashboardHeader } from "./dashboard-header"
import { DashboardEmptyState } from "./dashboard-empty-state"
import { LinksTable } from "./links-table"
import { ManageLinkDialog } from "./manage-link-dialog"
import { CreateLinkDialog } from "./create-link-dialog"

export function DashboardView() {
  const {
    links,
    copiedId,
    managingLink,
    manageAliasInput,
    aliasError,
    isDeleteConfirming,
    isCreatingNew,
    newUrl,
    newCustomAlias,
    newExpiry,
    handleCopy,
    handleOpenManage,
    handleCloseManage,
    handleSaveManage,
    handleConfirmDelete,
    handleCreateLink,
    setManageAliasInput,
    setAliasError,
    setIsDeleteConfirming,
    setIsCreatingNew,
    setNewUrl,
    setNewCustomAlias,
    setNewExpiry,
  } = useDashboard()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-electric-blue/15 selection:text-electric-blue">
      {/* 1. Authenticated Nav Bar */}
      <DashboardHeader />

      {/* Main Container */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground">
              My Links
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono text-muted-foreground bg-paper border border-border">
              {links.length} active links
            </span>
          </div>

          <Button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="h-10 sm:h-9 px-4 text-sm sm:text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg gap-1.5 active:scale-[0.98] shrink-0"
          >
            <Plus className="size-4" />
            <span>New Link</span>
          </Button>
        </div>

        {/* Content: Populated Table vs Empty State */}
        <div className="mt-6">
          {links.length === 0 ? (
            <DashboardEmptyState onCreateNew={() => setIsCreatingNew(true)} />
          ) : (
            <LinksTable
              links={links}
              copiedId={copiedId}
              onCopy={handleCopy}
              onOpenManage={handleOpenManage}
            />
          )}
        </div>
      </main>

      {/* Unified Manage Link Modal */}
      <ManageLinkDialog
        managingLink={managingLink}
        manageAliasInput={manageAliasInput}
        aliasError={aliasError}
        isDeleteConfirming={isDeleteConfirming}
        onClose={handleCloseManage}
        onAliasInputChange={setManageAliasInput}
        onSaveManage={handleSaveManage}
        onConfirmDelete={handleConfirmDelete}
        onToggleDeleteConfirming={setIsDeleteConfirming}
      />

      {/* Quick Create Link Modal */}
      <CreateLinkDialog
        isOpen={isCreatingNew}
        newUrl={newUrl}
        newCustomAlias={newCustomAlias}
        newExpiry={newExpiry}
        onOpenChange={setIsCreatingNew}
        onUrlChange={setNewUrl}
        onCustomAliasChange={setNewCustomAlias}
        onExpiryChange={setNewExpiry}
        onCreateLink={handleCreateLink}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>shortenTHATlink • Authenticated Dashboard</span>
          <span className="font-mono text-[11px] flex items-center gap-1.5">
            <Sparkles className="size-3 text-electric-blue" />
            <span>Zero surveillance • Direct 302 hop</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
