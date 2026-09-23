"use client"

import Link from "next/link"
import { Link2, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShortenerForm } from "@/features/shortener/components/shortener-form"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-electric-blue/15 selection:text-electric-blue">
      {/* 1. Sticky Navigation Bar */}
      <header className="border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-electric-blue rounded-md"
          >
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center border border-border/20 shadow-xs">
              <Link2 className="size-4 text-electric-blue transition-transform group-hover:scale-105" />
            </div>
            <div className="flex items-baseline font-mono text-sm tracking-tight font-semibold text-foreground">
              <span>shorten</span>
              <span className="text-electric-blue font-bold px-0.5">THAT</span>
              <span>link</span>
            </div>
          </Link>

          {/* Right Navigation: Theme Toggle + Dashboard/Sign in */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {session ? (
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/dashboard" />}
                className="h-9 px-4 text-xs font-medium border-border/80 hover:border-border hover:bg-paper active:scale-[0.98]"
              >
                <span>Dashboard</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/login" />}
                className="h-9 px-4 text-xs font-medium border-border/80 hover:border-border hover:bg-paper active:scale-[0.98]"
              >
                <span>Sign in</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="w-full max-w-xl flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-foreground leading-[1.12]">
            Shorten. Share. <br className="hidden sm:inline" />
            Track less, ship faster.
          </h1>

          {/* Subheadline */}
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-md">
            Instant, zero-surveillance short links with custom aliases and zero tracking overhead.
          </p>

          {/* 3. The Hero URL Shortener Feature */}
          <ShortenerForm />

          {/* 4. Below the hero card: link to dashboard if logged in */}
          {session ? (
            <div className="mt-5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors group"
              >
                <span>View your dashboard</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 text-electric-blue" />
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors group"
              >
                <span>Sign in to save and manage your links</span>
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5 text-electric-blue" />
              </Link>
            </div>
          )}

          {/* Subtle trust signal */}
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground select-none">
            <Sparkles className="size-3.5 text-electric-blue" />
            <span>Zero surveillance • 0ms telemetry • Hairline precision</span>
          </div>
        </div>
      </main>

      {/* 5. Minimal Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>shortenTHATlink • Zero surveillance URL shortener</span>
          <span className="font-mono text-[11px]">No cookies • No tracking pixels • Instant 302</span>
        </div>
      </footer>
    </div>
  )
}
