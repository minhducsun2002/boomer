import { Beatmap } from "./beatmap";

export interface osuUser {
    id: number;
    username: string;
    join_date: ReturnType<Date['toJSON']>;
    country: { code: string, name: string };
    avatar_url: string;
    is_supporter: boolean; has_supported: boolean;
    is_restricted: boolean;
    is_gmt: boolean; is_nat: boolean; is_bng: boolean;
    is_full_bn: boolean; is_limited_bn: boolean;
    is_bot: boolean; is_active: boolean; is_moderator: boolean;

    location: string;
    last_visit: null | string;
    is_online: boolean;

    statistics: {
        level: { current: number, progress: number },
        pp: number, ranked_score: number, hit_accuracy: number,
        play_count: number, play_time: number, total_score: number, total_hits: number, maximum_combo: number,
        is_ranked: boolean,
        grade_counts: { ss: number, ssh: number, s: number, sh: number, a: number },
        global_rank: number, country_rank: number,
        rank: { country: number }
    }
}

export interface osuUserExtra {
    scoresBest: {
        id: number;
        user_id: number; best_id: number;
        accuracy: number;
        mods: string[];
        score: number;
        perfect: boolean;
        pp: number;
        rank: string;
        created_at: ReturnType<Date['toJSON']>;
        max_combo: number;
        beatmap: Beatmap;
        beatmapset: {
            id: number;
            title: string, artist: string, source: string, creator: string;
        };
        statistics: {
            count_50: number; count_100: number; count_300: number;
            count_geki: number; count_katu: number; count_miss: number;
        }
    }[]
}