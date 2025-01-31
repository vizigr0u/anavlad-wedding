import { AppConfig } from './types';

export const defaultAppConfig: AppConfig = {
    contactName: "contact@youremail.com", // displayed for users that can't login, doesn't have to be an e-mail.
    adminConfig: {
        consoleKeyCode: "Backquote",
        dataRefreshRateMs: 5000
    },
    coupleNames: [
        "Demo",
        "Dima"
    ],
    eventDisplayAsTimeline: true,
    homeSlideShow: {
        intervalMs: 5000,
        slides: [
            {
                verticalSrc: "/user-data/images/slideshow/anavlad_v1.jpg",
                horizontalSrc: "/user-data/images/slideshow/anavlad.jpg",
                descriptionKey: "Caption-1"
            },
            {
                verticalSrc: "/user-data/images/slideshow/anavlad_v2.jpg",
                horizontalSrc: "/user-data/images/slideshow/anavlad_h2.jpg",
                descriptionKey: "Caption-2"
            },
            {
                verticalSrc: "/user-data/images/slideshow/anavlad_v3.jpg",
                horizontalSrc: "/user-data/images/slideshow/anavlad_h3.jpg",
                descriptionKey: "Caption-3"
            },
            {
                verticalSrc: "/user-data/images/slideshow/anavlad_v4.jpg",
                horizontalSrc: "/user-data/images/slideshow/anavlad_h4.jpg",
                descriptionKey: "Caption-4"
            },
            {
                verticalSrc: "/user-data/images/slideshow/anavlad_v5.jpg",
                horizontalSrc: "/user-data/images/slideshow/anavlad_h5.jpg",
                descriptionKey: "Caption-5"
            }
        ]
    },
    foodMenu: [
        {
            class: "option-meat",
            translationKey: "Food-Option-Meat"
        },
        {
            class: "option-fish",
            translationKey: "Food-Option-Fish"
        }
    ],
    photoGalleryLink: "/gallery",
    enableCarpool: false,
    eventWarningKey: "TrafficWarning",
    showBankingInformation: true,
    languages: {
        en: {
            name: "English",
            locale: "en-US",
            dateFormat: "MMMM do"
        },
        fr: {
            name: "Français",
            locale: "fr-FR",
            dateFormat: "d MMMM"
        },
        br: {
            name: "Portugués",
            locale: "pt-BR",
            dateFormat: "d MMMM"
        }
    }
};
