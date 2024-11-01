import type { NextConfig } from "next";

const { NEXT_PUBLIC_MAIN_APP_URL } = process.env;

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/ui"],
  redirects: async () => {
    return [
      {
        source: "/dashboard",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/dashboard`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
