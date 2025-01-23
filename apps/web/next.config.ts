import type { NextConfig } from "next";

const { NEXT_PUBLIC_AUTH_APP_URL } = process.env;

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@shared/ui"],
  redirects: async () => {
    return [
      {
        source: "/sign-in",
        destination: `${NEXT_PUBLIC_AUTH_APP_URL}/sign-in`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
