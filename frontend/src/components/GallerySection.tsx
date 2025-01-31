import './style/GallerySection.css'

import { useTranslation } from "react-i18next";

import UsePhotos from '../hooks/UsePhotos';
import Section from './Section';
import Gallery from './Gallery';

export default function IntroSection() {
    const { photos } = UsePhotos();
    const { t } = useTranslation();

    return (
        <Section title={t('Photo-Gallery')} styleName='gallery' startExpanded={false}>
            <Gallery photoList={photos} />
        </Section>
    );
}
