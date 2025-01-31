export type WeddingData = {
    wedding_date: string;
    wedding_timezone: string;
    answer_date: string;
    wedding_venue_name: string;
    wedding_events: { date: string, event: string }[],
    wedding_address: string;
    wedding_city: string;
    google_maps_iframe_src: string;
};

export type PaymentMethod = {
    name: string;
    text: string;
    fields: {
        [key: string]: string;
    }
};

export type AttendeeData = {
    id: number;
    name: string;
    rsvpAnswer: null | number;
    foodPreferences: string;
    comment: string;
}

export type AttendeeDataToSync = { [key: string]: string | null | number };

export type AdminData = {
    previewUserId: number;
    lastViewedNotif: string;
}

export type UserData = {
    lang: string;
    attendees: AttendeeData[];
    lastViewedNotif: string;
    rsvpLimitDate: string;
    weddingData: WeddingData;
    admin: AdminData | undefined;
}

export enum LoginStatus {
    LoggedOff,
    LoadingData,
    LoggingIn,
    LoggedIn,
    LoginFailed
}

export interface Carpool {
    name: string,
    contact: string,
    isMine?: boolean,
    seats: number,
    languages: string[],
    message: string
}

export type GalleryPhoto = {
    src: string,
    thumbnail: string,
    width: number,
    height: number,
    thumbnailWidth: number,
    thumbnailHeight: number
}

export enum EventTimeDisplay {
    SimpleTime, Timeline
}

export interface StyledText {
    class: string;
    translationKey: string;
}

export interface AppConfig {
    coupleNames: string[];
    contactName: string;
    eventDisplayAsTimeline: boolean;
    homeSlideShow: HomeSlideShowConfig;
    foodMenu: StyledText[];
    photoGalleryLink: string | null;
    enableCarpool: boolean;
    eventWarningKey: string | null;
    showBankingInformation: boolean;
    adminConfig: AdminConfig;
    languages: LanguageConfig;
}

export interface SlideshowSlide {
    verticalSrc: string;
    horizontalSrc: string;
    descriptionKey: string;
}

export interface HomeSlideShowConfig {
    intervalMs: number;
    slides: SlideshowSlide[];
}

export type LanguageConfig = {
    [key: string]: {
        name: string;
        locale: string;
        dateFormat?: string;
    }
};

export interface AdminConfig {
    consoleKeyCode: string;
    dataRefreshRateMs: number;
}
