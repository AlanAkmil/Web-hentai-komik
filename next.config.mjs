/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mencegah Webpack bundling paket cheerio & undici ke client/flight loader
  serverExternalPackages: ['cheerio', 'undici'],

  // Mengizinkan Next.js Image Component memuat gambar external dari target
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
