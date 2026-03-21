/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    AGENT_BACKEND_URL: process.env.AGENT_BACKEND_URL || 'http://daedalus:8100',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'assets.tina.io' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
    ];
  },
};

module.exports = nextConfig;
