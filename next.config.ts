
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Removed placehold.co entry if it was the only one.
      // If other patterns existed, they would remain.
      // Assuming it was the only entry based on the previous request.
    ],
  },
};

export default nextConfig;
