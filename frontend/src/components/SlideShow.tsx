import './style/SlideShow.css'

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../AppConfigContext';

export default function SlideShow({ styleName, children }: { styleName: string, children: React.ReactNode }) {
    const config = useContext(ConfigContext);
    const slideShow = config.homeSlideShow;
    const { t } = useTranslation();
    const [slideNumber, setSlideNumber] = useState(0);
    const slides = slideShow.slides;
    const numSlides = slides.length;

    useEffect(() => {
        const interval = setInterval(() => {
            setSlideNumber((n) => (n + 1) % numSlides);
        }, slideShow.intervalMs);
        return () => clearInterval(interval);
    }, [slideNumber]);

    const slide = slides[slideNumber];
    const nextSlide = slides[(slideNumber + 1) % numSlides];

    return <div className={styleName}>
        <picture className='slideshow__slide'>
            <source srcSet={slide.horizontalSrc} media="(orientation: portrait)" />
            <source srcSet={slide.verticalSrc} media="(orientation: lanscape)" />
            <img src={slide.verticalSrc} alt={t(slide.descriptionKey)} />
            {children}
            {<div className="slideshow__caption">
                {t(slide.descriptionKey)}
            </div>
            }
            <div className="slideshow__progress-bar" style={{ animationDuration: `${slideShow.intervalMs}ms` }} key={slideNumber} ></div>
        </picture>
        <picture className='slideshow-preload-hidden'>
            <source srcSet={nextSlide.horizontalSrc} media="(orientation: portrait)" />
            <source srcSet={nextSlide.verticalSrc} media="(orientation: lanscape)" />
            <img src={nextSlide.verticalSrc} alt={t(nextSlide.descriptionKey)} />
        </picture>
    </div>;
}