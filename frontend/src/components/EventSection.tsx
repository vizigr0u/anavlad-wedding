import { useTranslation } from "react-i18next";
import './style/EventSection.css'
import MapIcon from '@mui/icons-material/Map';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';

import { forwardRef, useContext, useState } from "react";
import Section from "./Section";
import usePrivateTranslation from "../hooks/UsePrivateTranslation";
import { GetLocale } from "../translation";
import { AppConfig, WeddingData } from "../types";
import { ConfigContext } from "../AppConfigContext";

const GoogleMapPreview = forwardRef(({ weddingData, handleClose }: { weddingData: WeddingData, handleClose: () => void }, _ref) => {
    const { t } = useTranslation();

    const { wedding_venue_name: venue_name, wedding_address: address, google_maps_iframe_src: src } = weddingData;

    const addressToCopy = `${venue_name}\n${address}`;
    const mapAddress = encodeURIComponent(addressToCopy.replace("\n", ","));
    const mapUri = 'https://www.google.com/maps/search/?api=1&query=' + mapAddress;

    return weddingData === undefined ? null : (
        <div className="map-preview">
            <div className="map-preview__toolbox">
                <a className="venue-link" href={mapUri}
                    target="_blank" rel="noopener noreferrer">
                    <OpenInNewIcon fontSize="large" />{t('Open-Map')}
                </a>
                <button className="venue__button map-preview__close-button" onClick={handleClose}>
                    {t('Close')}
                    <div className="venue-button__icon map-preview__close-icon"><CloseIcon fontSize="large" /></div>
                </button>
            </div>
            <Skeleton><div className="google-maps-preview-skeleton"></div></Skeleton>
            <iframe title="Google maps preview" className="google-maps-preview" src={src} style={{ border: 0 }} allowFullScreen={undefined} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
    )
});

function EventWarning({ translationKey }: { translationKey: string }) {
    const { t } = usePrivateTranslation();
    return <div className="warning-box">{t(translationKey)}</div>
}

function VenueAddress({ weddingData }: { weddingData: WeddingData | undefined }) {
    const { t } = useTranslation();
    const [mapOpen, setMapOpen] = useState(false);

    const handleOpen = () => setMapOpen(true);
    const handleClose = () => setMapOpen(false);

    if (!weddingData)
        return null;

    const { wedding_venue_name: venue_name, wedding_address: address } = weddingData;

    return (
        <>
            <div className="venue-address">
                <fieldset className="venue-fieldset">
                    <legend className="venue-fieldset__legend">{t('Address')}</legend>
                    <span className="venue-name">{venue_name}</span>
                    <p className="venue-postal-address">{address}</p>
                </fieldset>
                <button onClick={handleOpen}
                    className="venue__button venue-address__map-button">
                    <span className="venue-button__icon"><MapIcon fontSize="large" /></span> {t('Show-Address-On-Map')}
                </button>
            </div>
            <Modal open={mapOpen} onClose={handleClose} >
                <GoogleMapPreview weddingData={weddingData} handleClose={handleClose} />
            </Modal>
        </>
    );
}

type TimeLineEvent = {
    date: string;
    event: string;
};

function getTimeStringFromDate(config: AppConfig, date: Date, timeZone: string): string {
    const locale = GetLocale(config);
    const shortTime = Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric", timeZone: timeZone });
    return shortTime.format(date);
}

function TimeLine({ timeline, weddingData }: { timeline: TimeLineEvent[], weddingData: WeddingData }) {
    const config = useContext(ConfigContext);
    const { wedding_timezone: timeZone } = weddingData;
    const { t } = usePrivateTranslation();

    return <div className="event-timeline-section">
        <div className="event-timeline-container">
            <h3 className="event-timeline-title">{t('Timeline')}</h3>
            <ul className="event-timeline-events">
                {timeline.map((e, i) =>
                    <li key={i} className="timeline-event">
                        <h4>{getTimeStringFromDate(config, new Date(e.date), timeZone)}</h4>
                        <p>{t(e.event)}</p>
                    </li>)}
            </ul>
        </div>
    </div>;
}

function TimeDisplay({ weddingData }: { weddingData: WeddingData | undefined }) {
    if (!weddingData) {
        return null;
    }

    const config = useContext(ConfigContext);

    if (!config.eventDisplayAsTimeline) {
        return <TimeLine timeline={weddingData.wedding_events} weddingData={weddingData} />;
    }

    const { t } = usePrivateTranslation();
    const { wedding_date: dateStr, wedding_timezone: timeZone } = weddingData;
    const weddingTimeString = getTimeStringFromDate(config, new Date(dateStr), timeZone);
    return <div className="event-start-time">{t('From-Start-Hour', { 'start-hour': weddingTimeString })}</div>;
}

export default function EventSection({ weddingData }: { weddingData: WeddingData | undefined }) {
    const { eventWarningKey } = useContext(ConfigContext);
    const { t } = usePrivateTranslation();

    return (
        <Section title={t("Event")} styleName={'event'} >
            {eventWarningKey && <EventWarning translationKey={eventWarningKey} />}
            <VenueAddress weddingData={weddingData} />
            <TimeDisplay weddingData={weddingData} />
        </Section>
    )

}