import { useEffect, useState } from "react";
import { TFunction, i18n } from "i18next";
import { useTranslation } from "react-i18next";

type UsePrivateTranslationResponse = {
    t: TFunction<'translation', undefined>;
    i18n: i18n;
    ready: boolean;
};

export default function usePrivateTranslation(): UsePrivateTranslationResponse {
    const { t, i18n, ready } = useTranslation();
    const [reload, setReload] = useState<boolean>(false);
    const testText = 'Private-Text';
    const translated = t(testText);

    useEffect(() => {
        if (translated === testText) {
            const timeOut = setTimeout(() => setReload(!reload), 100);
            return () => clearTimeout(timeOut);
        }
    }, [t, reload, translated]);

    return { t, i18n, ready };
}
