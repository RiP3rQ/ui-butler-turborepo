import localFont from "next/font/local";
import "@shared/ui/globals.css";
import { ThemeProvider } from "@shared/ui/providers/theme-provider";
import type { Metadata } from "next";
import { Toaster } from "@shared/ui/components/ui/sonner";
import { SITE_CONFIG } from "@/config";
import { QueryProvider } from "@/components/query-provider";
import { PrefetchCrossZoneLinks } from "@/components/prefetch-cross-zone-links";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = SITE_CONFIG satisfies Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased max-w-full overflow-x-hidden`}
      >
        <QueryProvider>
          <ThemeProvider defaultTheme="dark">
            {children}
            <Toaster />
            <PrefetchCrossZoneLinks
              hrefs={[
                // MAIN APP MICRO FRONTEND REDIRECTS
                "/dashboard",
                "/analytics-dashboard",
                "/billing",
                "/projects",
                "/workflow",
                "/workflow-list",
                "/credentials",
                "/generate-component",
                "/save-component",
                "/setup",
                // LADING PAGE MICRO FRONTEND REDIRECTS
                "/",
              ]}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

// TODO: TESTS E2E
// TODO: UNIT TESTS
// TODO: GITHUB OAuth
