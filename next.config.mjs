/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    qualities: [70, 75, 85, 100],
  },

};

export default nextConfig;
