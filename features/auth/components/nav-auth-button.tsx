"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"

interface NavAuthButtonProps {
  initialIsAuthenticated: boolean
}

export function NavAuthButton({ initialIsAuthenticated }: NavAuthButtonProps) {
  const { data: session } = useSession()
  const isAuthenticated = session !== undefined ? Boolean(session) : initialIsAuthenticated

  if (isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href="/dashboard" />}
        className="h-9 px-4 text-xs font-medium border-border/80 hover:border-border hover:bg-paper active:scale-[0.98]"
      >
        <span>Dashboard</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link href="/login" />}
      className="h-9 px-4 text-xs font-medium border-border/80 hover:border-border hover:bg-paper active:scale-[0.98]"
    >
      <span>Sign in</span>
    </Button>
  )
}
