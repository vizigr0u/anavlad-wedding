import usePrivateTranslation from "../hooks/UsePrivateTranslation";
import './style/IntroSection.css'

export default function IntroSection() {
    const { t } = usePrivateTranslation();

    return (
        <section className='introduction-section' title=''>
            <div className={'section__icon introduction-section__icon'}></div>
            <div className={'section__content introduction-section__content'}>
                {t("Website-Introduction")}
            </div>
        </section>
    );
}
