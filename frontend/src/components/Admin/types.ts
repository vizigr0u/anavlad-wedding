export type AdminUserData = {
    user_id: number;
    token: string;
    email: string;
    last_login: string;
    last_viewed_notification: string;
    login_count: number;
    rsvp_limit_time: number | null;
    lang: string;
}
