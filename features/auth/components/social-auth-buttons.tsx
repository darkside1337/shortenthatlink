"use client"

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
  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      await signIn.social({
        provider,
        callbackURL,
      })
    } catch (err) {
      console.error("Sign in failed:", err)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthSignIn("google")}
        className="w-full h-11 sm:h-10 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-3 active:scale-[0.99]"
      >
        <GoogleIcon className="size-4 shrink-0" />
        <span>Continue with Google</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthSignIn("github")}
        className="w-full h-11 sm:h-10 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-3 active:scale-[0.99]"
      >
        <GitHubIcon className="size-4 shrink-0 text-foreground" />
        <span>Continue with GitHub</span>
      </Button>
    </div>
  )
}
