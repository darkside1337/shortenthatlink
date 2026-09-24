import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "shortenTHATlink — Zero surveillance URL shortener",
    template: "%s | shortenTHATlink",
  },
  description: "Instant, zero-surveillance short links with custom aliases and zero tracking overhead.",
  keywords: ["url shortener", "zero surveillance", "privacy", "custom alias", "no tracking", "clean link"],
  authors: [{ name: "shortenTHATlink" }],
  creator: "shortenTHATlink",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "shortenTHATlink",
    title: "shortenTHATlink — Zero surveillance URL shortener",
    description: "Instant, zero-surveillance short links with custom aliases and zero tracking overhead.",
  },
  twitter: {
    card: "summary_large_image",
    title: "shortenTHATlink — Zero surveillance URL shortener",
    description: "Instant, zero-surveillance short links with custom aliases and zero tracking overhead.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
