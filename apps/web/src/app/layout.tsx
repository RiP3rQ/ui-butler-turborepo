import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { cookies } from "next/headers";
import ToastProvider from "@repo/ui/providers/toast-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { DialogsComponentsProvider } from "@/providers/dialogs-provider";
import { getUserProjects } from "@/actions/projects/server-actions";

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
  title: "UI-Butler",
  description:
    "UI-Butler is a UI library for React applications built by @RiP3rQ!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, userProjects] = await Promise.all([
    cookies(),
    getUserProjects(),
  ]);

  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar userProjects={userProjects} />
            <main className="min-h-screen h-full w-full relative bg-muted">
              {children}
            </main>
            <ToastProvider />
            <DialogsComponentsProvider />
          </SidebarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
