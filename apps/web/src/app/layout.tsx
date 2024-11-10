import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { AppSidebar } from "@repo/ui/components/main-app/sidebar/app-sidebar";
import { cookies } from "next/headers";

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

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <main className="min-h-screen w-full relative pt-8 bg-muted">
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
