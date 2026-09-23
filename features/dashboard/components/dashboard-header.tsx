"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Link2, ChevronDown, LayoutDashboard, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession, signOut } from "@/lib/auth-client"

export function DashboardHeader() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      router.replace("/login")
    }
  }

  const userName = session?.user?.name || "Alex Chen"
  const userEmail = session?.user?.email || "alex@shorten.link"
  const userImage = session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces"
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "AC"

  return (
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

        {/* Right Navigation: Theme Toggle + User Avatar Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/60 transition-colors h-auto"
                  aria-label="User account menu"
                />
              }
            >
              <Avatar className="size-8 border border-border/80">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-xs font-mono font-medium">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium leading-none text-foreground">{userName}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{userEmail}</span>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              <DropdownMenuLabel className="px-2 py-1.5">
                <p className="text-xs font-medium text-foreground">{userName}</p>
                <p className="text-[11px] font-mono text-muted-foreground truncate">{userEmail}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer bg-paper">
                <LayoutDashboard className="size-3.5 text-electric-blue" />
                <span className="font-medium">My Links</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer">
                <User className="size-3.5 text-muted-foreground" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="gap-2 text-xs py-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
