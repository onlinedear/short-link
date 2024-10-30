/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'pbxt.replicate.delivery',
      'g4yqcv8qdhf169fk.public.blob.vercel-storage.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/s/:code',  // 自定义的 URL
        destination: '/api/s/:code',  // 实际 API 路径
      },
    ];
  },
};

module.exports = nextConfig;