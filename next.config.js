/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['files.stripe.com'],
    unoptimized: true, // Desabilita a otimização de imagens
  },
};

module.exports = nextConfig;
