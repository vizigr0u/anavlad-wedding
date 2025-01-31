import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { AppConfig } from "./types";
// import public_resources from "./translation_public.json";

export function GetLocale(config: AppConfig): string {
    return config.languages[i18next.resolvedLanguage ?? 'en']?.locale ?? 'en-US';
}

export default function InitI18() {
    i18next
        .use(LanguageDetector)
        .use(initReactI18next) // passes i18n down to react-i18next
        .use(Backend)
        .init({
            backend: {
                // for all available options read the backend's repository readme file
                loadPath: '/user-data/locales/{{lng}}.json',
            },
            fallbackLng: 'en',
            load: 'languageOnly',
            partialBundledLanguages: true, // load private translation later

            interpolation: {
                escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
                // format: (value, format, lng) => {
                //     if (isDate(value)) {
                //         const locale = locales[lng];

                //         if (format === "short")
                //             return formatDate(value, "P", { locale });
                //         if (format === "long")
                //             return formatDate(value, "PPPP", { locale });
                //         if (format === "relative")
                //             return formatRelative(value, new Date(), { locale });
                //         if (format === "ago")
                //             return formatDistance(value, new Date(), {
                //                 locale,
                //                 addSuffix: true
                //             });

                //         return formatDate(value, format, { locale });
                //     }

                //     return value;
                // }
            }
        });
}
