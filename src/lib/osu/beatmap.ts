import { GameMode, RankStatusString } from '../osu-v2';

export interface Beatmap {
    id: number; beatmapset_id: number;
    mode: GameMode; mode_int: number; convert: true | null;
    difficulty_rating: number; version: string;
    total_length: number; hit_length: number;
    bpm: number; cs: number, drain: number, accuracy: number, ar: number;
    playcount: number, passcount: number;
    max_combo: number;
    status: RankStatusString;

    count_circles: number;
    count_sliders: number;
    count_spinners: number;
    last_updated: string;
}