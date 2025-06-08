// Path: next.config.ts
import createIntlPlugin from "next-intl/plugin";

const withNextIntl = createIntlPlugin();  // <= เรียก plugin หนึ่งครั้ง

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ใส่ option Next.js เพิ่มได้ที่นี่
};

export default withNextIntl(nextConfig);  // <= export เป็น object เดียว
