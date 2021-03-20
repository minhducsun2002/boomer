import { GameMode } from "../enums/GameMode";
import Beatmap from "./Beatmap";
import User from "./User";

export default interface Score {
    id: number;
    user_id: number;
    accuracy: number;
    mods: string[];
    score: number;
    max_combo: number;
    perfect: boolean;
    statistics: {
        count_50: number,
        count_100: number,
        count_300: number,
        count_geki: number,
        count_katu: number,
        count_miss: number
    };
    rank: string;
    created_at: string;
    best_id: number;
    pp: number;
    mode: GameMode;
    mode_int: number;
    replay: boolean;
    beatmap: Beatmap;

    rank_country?: number;
    rank_global?: number;
    user?: User;
}