import Axios from 'axios';
import { URL } from 'url';
import { GameMode } from './enums/GameMode';
import { Score } from './interfaces';
import Beatmap from './interfaces/Beatmap';
import BeatmapUserScore from './interfaces/BeatmapUserScore';

export class OsuClient {
    private token: string;
    endpoint = 'https://osu.ppy.sh/api/v2/';
    constructor(token: string) {
        this.token = token;
    }

    private call_endpoint = async (path: string) => await Axios.get(new URL(path, this.endpoint).href, {
        headers: { 'Authorization': `Bearer ${this.token}` }
    });

    Beatmap = {
        lookup: ({ checksum, filename, id }: { checksum?: string, filename?: string, id: number }) =>
            this.call_endpoint(
                `beatmaps/lookup?` +
                [
                    ['checksum', checksum],
                    ['filename', filename],
                    ['id', id]
                ].map(_ => `${_[0]}=${encodeURIComponent(_[1] || '')}`).join('&')
            ).then(res => res.data as Beatmap),
        beatmap: (id: number) =>
            this.call_endpoint(`beatmaps/${id}`).then(res => res.data as Beatmap),
        score: (beatmapId: number, userId: number, { mode } : { mode?: GameMode }) =>
            this.call_endpoint(`beatmaps/${beatmapId}/scores/users/${userId}?mode=${mode || ''}`)
                .then(res => res.data as BeatmapUserScore)
    }

    Score = {
        get: (mode : GameMode, scoreId : number) => this.call_endpoint(`scores/${mode}/${scoreId}`).then(res => res.data as Score)
    }
}