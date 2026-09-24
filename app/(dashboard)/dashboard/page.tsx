import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { listUrlsForUser } from "@/lib/urls"
import { mapUrlsToLinkItems } from "@/features/dashboard/lib/link-mapper"
import { DashboardView } from "@/features/dashboard/components/dashboard-view"

export const metadata = {
  title: "Dashboard — shortenTHATlink",
  description: "Manage your shortened links, custom aliases, and expirations.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const host = (await headers()).get("host") ?? ""
  const rawUrls = await listUrlsForUser(user.id)
  const initialLinks = mapUrlsToLinkItems(rawUrls)

  return <DashboardView initialLinks={initialLinks} user={user} host={host} />
}
