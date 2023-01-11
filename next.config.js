/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  // PWA Specific Config
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  skipWaiting: true,
});

module.exports = withPWA({
  // Regular Next.js Config
  experimental: {
    appDir: true,
  },
  swcMinify: true,
});
