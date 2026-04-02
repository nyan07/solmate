import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/i18n/locales/en";
import de from "@/i18n/locales/de";

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            de: { translation: de },
        },
        fallbackLng: "en",
        supportedLngs: ["en", "de"],
        detection: {
            // Check the URL path segment first (e.g. /en/... or /de/...), then fall
            // back to browser preference. lookupFromPathIndex 0 = first non-empty
            // segment of window.location.pathname.
            order: ["path", "navigator"],
            lookupFromPathIndex: 0,
        },
        interpolation: {
            escapeValue: false, // React already escapes values
        },
    });

export default i18n;
