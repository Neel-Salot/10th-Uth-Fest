export type EventCategory = 'Dance' | 'Music' | 'Theatre' | 'Literary' | 'Fine Arts' | 'Diverse';

export interface Event {
    id: string;
    name: string;
    category: EventCategory;
    is_team: boolean;
    min_team_size: number;
    max_team_size: number;
    max_entries_per_institute: number;
    max_accompanists: number;
    min_time_minutes: number;
    max_time_minutes: number;
    venue?: string;
    date?: string;
    time?: string;
    rules_pdf_url?: string;
    is_prelim: boolean;
    created_at?: string;
}

export interface Institute {
    id: string;
    name: string;
    short_code: string;
}

export interface TeamLeader {
    id: string;
    name: string;
    email: string;
    phone: string;
    institute_id: string;
    user_id: string;
    must_set_password: boolean;
    created_at?: string;
}

export interface Participant {
    id: string;
    full_name: string;
    enrollment_no: string;
    phone?: string;
    email?: string;
    institute_id: string;
    event_id: string;
    sequence_no: number;
    role: 'participant';
    team_id?: string | null;
}

export interface Score {
    id: string;
    event_id: string;
    institute_id: string;
    rank: number;
    points: number;
    is_published: boolean;
}

export interface LiveStatus {
    id: string;
    event_id: string;
    current_sequence_no: number;
    current_participant_name: string;
    current_institute_name: string;
    status: 'performing' | 'upcoming' | 'completed';
    updated_at: string;
}
