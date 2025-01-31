import { useContext, useEffect, useRef } from "react";
import './style/LanguageMenu.css'

import TranslateIcon from '@mui/icons-material/Translate';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { UserData } from "../types";
import { ConfigContext } from "../AppConfigContext";

export function LanguageSelect({ lang, handleChange, styleName = '' }: { lang: string, handleChange: (newLang: string) => void, styleName?: string }) {
    const config = useContext(ConfigContext);
    const languages = config.languages;
    return (<div className={'language-select ' + styleName}>
        <label htmlFor="language-selector" className="language-icon" ><TranslateIcon /></label>
        <select id="language-selector" name='lang' value={lang} onChange={evt => handleChange(evt.target.value)}>
            {Object.keys(languages).map(lng => (
                <option key={lng} value={lng}>
                    {languages[lng].name}
                </option>
            ))}
        </select>
    </div>
    );
}

export default function LanguageMenu({ userData }: { userData: UserData | undefined }) {
    const { i18n } = useTranslation();

    const hasLoadedPrivate = useRef(false);
    const userWasLoggedIn = useRef(false);

    const userIsLoggedIn = !!userData?.lang;

    const loggedInThisRender = userIsLoggedIn && !userWasLoggedIn.current;
    if (loggedInThisRender) {
        userWasLoggedIn.current = true;
    }

    const queryClient = useQueryClient()
    const setLangMutation = useMutation({
        mutationFn:
            (lang: string) => axios.patch('/api/user', { lang: lang })
                .catch(err => { console.log('error ' + JSON.stringify(err)); return ({}); }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_user_data'] })
    }
    );

    function changeLanguage(lng: string) {
        if (i18n.language !== lng) {
            i18n.changeLanguage(lng);
            // if (!i18n.hasLoadedNamespace('translation', { lng }))
            i18n.reloadResources();
            if (userIsLoggedIn)
                setLangMutation.mutate(lng, { onSuccess: () => console.log('Successfully saved language preference: ' + lng) });
        }
    }

    type TranslationData = { [key: string]: { [key: string]: { [key: string]: string } } };

    function loadPrivateTranslationdata(data: TranslationData) {
        if (hasLoadedPrivate.current) {
            // console.log("Already loaded private translations.");
            return;
        }
        Object.entries(data).forEach(([lng, namespaces]) => {
            Object.entries(namespaces).forEach(([namespace, translations]) => {
                // console.log(`Adding i18next resources: ${namespace}:${lng}`);
                i18n.addResources(lng, namespace, translations);
            });
        });
        i18n.reloadResources();
        hasLoadedPrivate.current = true;
    }

    const { data, isSuccess } = useQuery<TranslationData>({
        queryKey: ["get_private_translations"],
        queryFn: async () => {
            try {
                const res = await axios.get("/private/translation_private.json");
                return res.data;
            } catch (err) {
                console.log('error ' + JSON.stringify(err));
                return ({});
            }
        },
        refetchOnWindowFocus: false,
        enabled: userIsLoggedIn === true,
    }
    );
    useEffect(() => {
        if (isSuccess) {
            loadPrivateTranslationdata(data);
        }
    }, [isSuccess]);

    useEffect(() => {
        if (loggedInThisRender) {
            changeLanguage(userData.lang);
        }
    }, [userIsLoggedIn, userData?.lang, i18n.language]);

    return <LanguageSelect lang={i18n.language} handleChange={changeLanguage} styleName={'language-menu'} />;
}
