import { RankStatusString } from '../enums/RankStatus';
import { GameMode } from '../enums/GameMode';
import Failtimes from './Failtimes';
import BeatmapsetCompact from './BeatmapsetCompact';

export default interface BeatmapCompact {
    difficulty_rating: number;
    id: number;
    mode: GameMode;
    status: RankStatusString;
    total_length: number;
    version: string;
    beatmapset?: BeatmapsetCompact;
    checksum?: string;
    failtimes?: Failtimes;
    max_combo?: number;
}