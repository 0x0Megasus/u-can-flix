/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    qualities: [70, 75, 85, 100],
    // Every image comes from TMDB's CDN in a pre-sized variant (w342/w500/
    // w1280), so there is nothing left to optimize. Routing through the
    // platform optimizer only burns quota and fails with
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED once it runs out.
    unoptimized: true,
  },

};

export default nextConfig;
