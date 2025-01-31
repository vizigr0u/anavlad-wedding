import { useTranslation } from "react-i18next";

export default function AboutUsSection() {
    const { t } = useTranslation();
    return (
        <section className="about-us">
            <h1>{t("AboutUs-title")}</h1>
            <span>{t("AboutUs-text")}</span>
        </section>
    );
}
