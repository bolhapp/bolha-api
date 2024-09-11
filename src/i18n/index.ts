import i18n from "i18n";

import { logError } from "@/services/sentry";

i18n.configure({
  locales: ["en", "pt"],
  directory: __dirname,
  defaultLocale: "en",
  fallbacks: { "pt-*": "pt", "en-*": "en" },
  header: "x-header-language",
  autoReload: process.env.NODE_ENV === "development",
  missingKeyFn: function (locale, value) {
    logError(`missing translation for ${locale}:${value}`);
    return value;
  },
  api: {
    __: "t", // now req.__ becomes req.t
    __n: "tn", // and req.__n can be called as req.tn
  },
});

export default i18n;
