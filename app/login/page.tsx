import Link from "next/link"
import { redirect } from "next/navigation"
import { Link2 } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata = {
  title: "Sign in — shortenTHATlink",
  description: "Sign in to manage and track your links.",
}

export default async function LoginPage() {
  const userId = await getCurrentUserId()
  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground select-none">
      {/* Top right theme toggle */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40">
        <ThemeToggle />
      </div>

      {/* Centered Single Card */}
      <Card className="w-full max-w-sm rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs animate-in fade-in-50 duration-200">
        {/* Brand Mark at Top of Card */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-electric-blue rounded-md"
            aria-label="shortenTHATlink home"
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

          {/* Heading: Medium weight, not bold */}
          <h1 className="text-lg font-medium tracking-tight text-foreground mt-5">
            Sign in to continue
          </h1>

          {/* Muted Subline */}
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage and track your links.
          </p>
        </div>

        {/* Two Full-Width Stacked OAuth Buttons */}
        <div className="mt-6">
          <SocialAuthButtons />
        </div>

        {/* Muted Terms Notice */}
        <p className="text-[11px] text-muted-foreground/80 mt-6 text-center leading-normal">
          By continuing, you agree to our terms.
        </p>
      </Card>

      {/* Subtle Return to Home Link */}
      <div className="mt-6 text-center">
        <Button
          variant="link"
          nativeButton={false}
          render={<Link href="/" />}
          className="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors h-auto p-0"
        >
          ← Back to home
        </Button>
      </div>
    </div>
  )
}
