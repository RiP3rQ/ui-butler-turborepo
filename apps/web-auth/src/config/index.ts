import type { Metadata } from "next";

export const SITE_CONFIG: Metadata = {
  title: {
    default: "UI-Butler | AI Powered Components Organizer",
    template: `%s | UI-Bulter`,
  },
  description:
    "UI-Butler is an AI powered components organizer that helps you build your next project faster. Test and document your components in one place.",
  icons: {
    icon: [
      {
        url: "/icons/favicon.ico",
        href: "/icons/favicon.ico",
      },
    ],
  },
  openGraph: {
    title: "UI-Butler | AI Powered Components Organizer",
    description:
      "UI-Butler is an AI powered components organizer that helps you build your next project faster. Test and document your components in one place.",
    images: [
      {
        url: "/assets/hero-image.png",
      },
    ],
  },
  metadataBase: new URL("http://localhost:3000/"),
};
