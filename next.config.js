/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Lets parallel local dev servers use separate build dirs (NEXT_DIST_DIR=.next-a). Unset in production.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  env: {
    AGENT_BACKEND_URL: process.env.AGENT_BACKEND_URL || 'http://daedalus:8100',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
};

module.exports = nextConfig;
