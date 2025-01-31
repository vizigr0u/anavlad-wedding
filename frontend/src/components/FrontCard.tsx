import './style/FrontCard.css'

import PleaseLogin from './PleaseLogin';
import PrivateHeader from './PrivateHeader';
import ScrollHintArrow from './ScrollHintArrow';
import { useTranslation } from 'react-i18next';
import { LoginStatus, WeddingData } from '../types';
import { Link } from 'react-router-dom';
import SlideShow from './SlideShow';
import { useContext } from 'react';
import { ConfigContext } from '../AppConfigContext';

function Content({ loginStatus, weddingData }: { loginStatus: LoginStatus, weddingData: WeddingData | undefined }) {
    return (loginStatus === LoginStatus.LoggedIn)
        ? <PrivateHeader weddingData={weddingData} />
        : <PleaseLogin loginStatus={loginStatus} />;
}

export default function FrontCard({ loginStatus, getHeaderHeight, weddingData }: { loginStatus: LoginStatus, getHeaderHeight?: any, weddingData?: WeddingData }) {
    const config = useContext(ConfigContext);
    const { t } = useTranslation();
    let isLoggedIn = loginStatus === LoginStatus.LoggedIn;
    const { coupleNames, photoGalleryLink } = config;
    return (
        <header className="front-card">
            <div className="content-half front-card__half">
                <div className="content__border front-card-border">
                    <div className='front-card__content'>
                        <div className='couple-name-container'>
                            <div className='couple-name couple-name-1'>{coupleNames[0]}</div>
                            <div className='couple-name-and'>&</div>
                            <div className='couple-name couple-name-2'>{coupleNames[1]}</div>
                        </div>
                        <Content weddingData={weddingData} loginStatus={loginStatus} />
                    </div>
                </div>
            </div>
            <SlideShow styleName="image-half front-card__half" >
                <div className="image__border front-card-border"></div>
            </SlideShow>
            {photoGalleryLink &&
                <Link to="/gallery" className="photos-link">
                    {t("Photos-Have-Arrived")}
                </Link>
            }
            {isLoggedIn && <ScrollHintArrow getHeaderHeight={getHeaderHeight} />}
        </header>
    );
};
