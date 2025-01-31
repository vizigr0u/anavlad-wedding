import './style/PrivateHeader.css';
import DateNoYear from './DateNoYear';
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { format, Locale } from "date-fns";
import { enUS as en, fr, ptBR as br } from "date-fns/locale";

import Skeleton from '@mui/material/Skeleton';
import { WeddingData } from '../types';

const locales: { [key: string]: Locale } = { en, fr, br };

function WeddingDate({ weddingDate }: { weddingDate: string }) {
    const locale = locales[i18next.language];
    const date = weddingDate ? new Date(weddingDate) : new Date();
    const dayOfWeek = format(date, "EEEE", { locale: locale });
    return (
        <div className='wedding-date'>
            <div className='wedding-day-of-week'>
                {dayOfWeek}
            </div>
            <div className='wedding-day-and-month'>
                <span className='wedding-day-number'>
                    <DateNoYear date={date} />
                </span>
                {/*
                    {mainDate}
                </span> */}
                <span className='wedding-month'>
                    {/* {month} */}
                </span>
            </div>
            <div className='wedding-year'>
                {date.getFullYear()}
            </div>
        </div>
    );
}

export default function PrivateHeader({ weddingData }: { weddingData: WeddingData | undefined }) {
    const { t } = useTranslation();

    function GetContent() {
        return (
            <div className='private-info'>
                <div className='header__invite-you-to'>
                    {/* {t("And-Their-Family")}<br /> */}
                    {t("Invite-You-To-Their-Wedding")}
                </div>
                <WeddingDate weddingDate={weddingData?.wedding_date ?? ''} />
                <div className='header__location-name'>
                    {t("In-Location", { location: weddingData?.wedding_city ?? t('Loading') + '...' })}
                </div>
            </div>
        )
    }

    return weddingData ? GetContent() : (
        <Skeleton>
            {GetContent()}
        </Skeleton>
    );
};
