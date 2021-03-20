import BeatmapCompact from './BeatmapCompact';
import { GameMode } from '../enums/GameMode';
import BeatmapsetCompact from './BeatmapsetCompact';
import { Timestamp } from './Timestamp';

export default interface Beatmap extends BeatmapCompact {
    id: number; beatmapset_id: number;
    mode: GameMode;
    mode_int: number;
    convert: boolean;
    difficulty_rating: number;
    version: string;
    total_length: number;
    hit_length: number;
    bpm: number;
    cs: number, drain: number, accuracy: number, ar: number;
    playcount: number, passcount: number;
    max_combo: number;
    count_circles: number;
    count_sliders: number;
    count_spinners: number;
    deleted_at?: Timestamp; last_updated: Timestamp;

    beatmapset?: BeatmapsetCompact;
}