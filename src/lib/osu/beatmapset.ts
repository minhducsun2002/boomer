import type { Beatmap } from './beatmap';
export interface Beatmapset {
    id: number;
    title: string; title_unicode: string | null;
    artist: string; artist_unicode: string | null;
    play_count: number; favourite_count: number;
    submitted_date: string; last_updated: string; ranked_date: string;
    source: string; tags: string; preview_url: string;
    video: boolean; storyboard: boolean;
    ranked: number; status: string;

    beatmaps: Beatmap[]; converts: Beatmap[];

    creator: string; user_id: number;
    covers: {
        cover: string; 'cover@2x': string;
        card: string; 'card@2x': string;
        list: string; 'list@2x': string;
        slimcover: string; 'slimcover@2x': string;
    };
}