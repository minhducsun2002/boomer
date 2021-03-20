import Beatmap from './Beatmap';
import Covers from './Covers';
export default interface BeatmapsetCompact {
    artist: string;
    artist_unicode: string;
    cover: Covers;
    creator: string;
    favourite_count: number
    id: number
    play_count: number
    preview_url: string;
    source: string;
    status: string;
    title: string;
    title_unicode: string;
    user_id: number
    video: string;

    beatmaps?: Beatmap[];
    converts?: Beatmap[];
}