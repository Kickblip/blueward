import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!).hostname,
        port: "",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 2678400,
  },
}

export default nextConfig
