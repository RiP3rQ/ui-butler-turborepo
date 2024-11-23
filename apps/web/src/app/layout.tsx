import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { cookies } from "next/headers";
import ToastProvider from "@repo/ui/providers/toast-provider";
import getCurrentUser from "@/actions/user/get-current-user.ts";
import { QueryProvider } from "@/providers/query-provider.tsx";
import { AppSidebar } from "@/components/sidebar/app-sidebar.tsx";

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

  const currentLoggedUser = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar currentLoggedUser={currentLoggedUser} />
            <main className="min-h-screen h-full w-full relative pt-8 bg-muted">
              {children}
            </main>
            <ToastProvider />
          </SidebarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
