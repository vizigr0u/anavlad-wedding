import './style/DateNoYear.css'
import i18next from "i18next";
import { format, Locale } from "date-fns";
import { enUS as en, fr, ptBR as br } from "date-fns/locale";
import { useContext } from 'react';
import { ConfigContext } from '../AppConfigContext';
import { AppConfig } from '../types';

const localesByName: { [key: string]: Locale } = { en, fr, br };

function GetFormatsByName(config: AppConfig): { [key: string]: string } {
    const languages = config.languages;

    for (const lang of Object.keys(languages)) {
        if (!Object.keys(localesByName).includes(lang)) {
            console.warn('Language not supported in DateNoYear, please add the locale to localesByName variable: ' + lang);
        }
    }

    return Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, v.dateFormat ?? "d MMMM"]));
}


export default function DateNoYear({ date }: { date: Date }) {
    const lang = i18next.language;
    const locale = localesByName[lang];
    const config = useContext(ConfigContext);
    const formatsByName = GetFormatsByName(config);
    const mainDateFormat = formatsByName[lang] ?? "d MMMM";
    const mainDate = format(date, mainDateFormat, { locale: locale });
    if (lang === 'en') {
        const ordinalIndicator = mainDate.match(/[a-zA-Z]{2}$/);
        return <>{mainDate.substring(0, mainDate.length - 2)}<sup className='date-no-year__sup'>{ordinalIndicator}</sup></>
    }
    return <>{mainDate}</>;
}
