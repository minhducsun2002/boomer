import type { Beatmap } from './beatmap';
import type { Beatmapset } from './beatmapset';
import type { Except } from 'type-fest';
import type { osuUser } from './user';
import type { GameMode } from '../osu-v2'

export interface Score {
    id: number, user_id: number, best_id: number;
    mode: GameMode, mode_int: number,
    mods: string[], score: number, accuracy: number, max_combo: number, pp: number,
    perfect: boolean,
    rank: string, created_at: string,
    replay: boolean,
    beatmap: Beatmap, beatmapset: Except<Except<Beatmapset, 'beatmaps'>, 'converts'>,
    rank_country: number, rank_global: number,
    user: Partial<osuUser>,
    statistics: {
        count_50: number
        count_100: number,
        count_300: number,
        count_geki: number,
        count_katu: number,
        count_miss: number
    }
}