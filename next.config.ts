import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'xelene.me',
            }
        ]
    },
    serverExternalPackages: ['openai']
};

export default nextConfig;
