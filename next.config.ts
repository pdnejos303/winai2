// Path: next.config.ts
import createIntlPlugin from "next-intl/plugin";

const withNextIntl = createIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /* Next-14/15 แนะนำ remotePatterns แทน images.domains */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"          // โหลด avatar ทุกขนาด
      }
    ]
  },

  /* ใช้ rewrites ให้ /th/tasks → /th/app/tasks (ถ้าไม่ใส่ไฟล์ redirect) */
  async rewrites() {
    return [
      {
        source: "/:locale([a-z]{2})/tasks",
        destination: "/:locale/app/tasks"
      }
    ];
  }
};

export default withNextIntl(nextConfig);
