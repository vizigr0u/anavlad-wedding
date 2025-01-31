export interface AdminAttendeeData {
    user_id: number;
    attendee_id: number;
    name: string;
    rsvp_answer: number | null;
}

export type Affinities = {
    [key: number]: {
        lang: number;
        affinities: {
            [key: number]: number;
        };
    };
};
