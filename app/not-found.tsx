import Link from "next/link"
import { Link2Off, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function NotFound() {
  return (
    <>
      <head>
        <title>404 — Link Not Found | shortenTHATlink</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-background text-foreground select-none">
        {/* Top right theme toggle */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40">
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center max-w-sm w-full animate-in fade-in-50 duration-200">
          {/* Simple line icon in muted Steel/Ash tone — small, quiet, not decorative */}
          <div className="size-10 rounded-full border border-border bg-paper/60 flex items-center justify-center text-muted-foreground mb-4">
            <Link2Off className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </div>

          {/* Headline in calm medium weight */}
          <h1 className="text-base sm:text-lg font-medium tracking-tight text-foreground">
            This link doesn&apos;t exist or has expired.
          </h1>

          {/* Muted helper line */}
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xs">
            Double-check the URL or create a new one.
          </p>

          {/* Single pill-shaped button below, standard Charcoal/Steel palette */}
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
              className="h-9 px-4 rounded-full border-border/80 hover:border-border hover:bg-paper text-xs font-medium text-foreground gap-1.5 transition-all active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Back to home</span>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
