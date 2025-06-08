/** @type {import('next-intl').Config} */
module.exports = {
  locales: ["en", "th", "ja"],
  defaultLocale: "en",
  localePrefix: "always"          // URL จะเป็น /en/…, /th/…
};
