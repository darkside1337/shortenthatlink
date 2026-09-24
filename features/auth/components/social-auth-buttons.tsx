"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoogleIcon, GitHubIcon } from "@/components/SVG"
import { signIn } from "@/lib/auth-client"

interface SocialAuthButtonsProps {
  callbackURL?: string
  className?: string
}

export function SocialAuthButtons({
  callbackURL = "/dashboard",
  className = "flex flex-col gap-2.5",
}: SocialAuthButtonsProps) {
  const [pending, setPending] = useState<"google" | "github" | null>(null)

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    if (pending) return
    setPending(provider)
    try {
      await signIn.social({
        provider,
        callbackURL,
      })
    } catch (err) {
      console.error("Sign in failed:", err)
      setPending(null)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthSignIn("google")}
        disabled={pending !== null}
        className="w-full h-11 sm:h-10 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-3 active:scale-[0.99]"
      >
        {pending === "google" ? (
          <>
            <Loader2 className="size-4 shrink-0 animate-spin" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <GoogleIcon className="size-4 shrink-0" />
            <span>Continue with Google</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthSignIn("github")}
        disabled={pending !== null}
        className="w-full h-11 sm:h-10 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-3 active:scale-[0.99]"
      >
        {pending === "github" ? (
          <>
            <Loader2 className="size-4 shrink-0 animate-spin" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <GitHubIcon className="size-4 shrink-0 text-foreground" />
            <span>Continue with GitHub</span>
          </>
        )}
      </Button>
    </div>
  )
}
